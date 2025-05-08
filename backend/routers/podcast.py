from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from database import get_db, documents_table
from services import podcast_audio_generator
from database import podcasts_table
from sqlalchemy import desc

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
client = genai.Client(api_key=GOOGLE_API_KEY)

router = APIRouter()
sys_instruct = "You are an expert podcast scriptwriter. You create structured, engaging, and well-organized podcast outlines."


@router.post("/createpodcast/{space_id}")
async def podcastGen(space_id: str, focus_topic: str = None, db: Session = Depends(get_db)):
    query = db.query(documents_table.c.extracted_text).filter(documents_table.c.space_id == space_id)
    extracted_texts = query.all()
    extracted_texts = [text[0] for text in query.all() if text[0] is not None]
    all_texts = " ".join(extracted_texts)

    preprocessed_text = None
    if focus_topic:
        print('Preprocessing process started')
        preprocessing = client.models.generate_content(
            model="gemini-2.0-flash",
            
                contents=[
                    f"""Extract all text relevant to the topic {focus_topic} from the provided textbook content. Ensure completeness by including definitions, explanations, and discussions directly related to the topic. Additionally, include context buffers (adjacent paragraphs) to maintain coherence and avoid missing critical information"""
                    f"{all_texts}"
                
                ]
        )

        preprocessed_text = preprocessing.text
        print('Preprocessing process completed')
    preprocessed_text = all_texts
    # outlinegenereration
    print('Outline Generation started')
    outline_response = client.models.generate_content(
    model="gemini-2.0-flash",
    config=types.GenerateContentConfig(system_instruction=sys_instruct),
    contents=[
        f"Generate a structured podcast outline using the provided chapter text. "
        "Each section should be summarized in one or two sentences max."
        "Organize it into these sections:\n"
        "1. Introduction (Engage the audience, introduce key ideas)\n"
        "2. Key Concepts (Break down important definitions, theories, or principles)\n"
        "3. Debates & Challenges (Discuss common controversies or misunderstandings)\n"
        "4. Applications & Real-World Examples (How is this knowledge used?)\n"
        "5. Conclusion (Summarize takeaways, future perspectives, and open questions)\n\n"
        f"Chapter Text:\n{preprocessed_text}"
    ]
)
    print('Outline Generation completed')
    # print(outline_response.text)

    # rolebasedsummarization
    print("Role based summarization started")
    rolebasedSummarization_response= client.models.generate_content(
    model="gemini-2.0-flash",
    config=types.GenerateContentConfig(system_instruction=sys_instruct),
    contents=[
        "Generate two summaries for the given text"
        "expert Level:"
        "Summarize the given chapter text as if you are explaining it to an advanced scholar or researcher in this field. Include"
        "Technical terminology & in-depth analysis"
        "Key theories,models"
        "cross references to similar topics os historical developlments"
        "challenges,contradictions,and nuances"
        "novice level:"
        "summarize the given chapter text in a way that a beginner with no background knowledge can understand use:"
        "simple language and analogies"
        "examples form everyday life"
        "common misconceptions and how to clarify them"
        "engaging questions to spark curiosity"
        f"Chapter Text:\n{preprocessed_text}"

    ]   
)
    print("Role based summarization completed")

    # Diaglougegeneration
    print("Dialouge generation started")
    dialogue_generated = client.models.generate_content(
    model="gemini-2.0-flash",
    config=types.GenerateContentConfig(system_instruction="Generate a 10-minute podcast dialogue (≈1500 words) between two AI personas. Format: [Speaker]: [Dialogue line]. No markdown, no scene descriptions, only natural conversation. "),
    contents=[
        "Create a podcast dialogue between two AI personas"
        "AI 1(expert):A professor-level speaker who explains with deep knowledge"
        "AI 2 (Novice): A curious learner who asks simple but thought provoking questions"
        "use the outline below to structure the conversation. the expert should explain using the expert summary, while the novice should challenge ideas ask for examples or request simpler explanations using the novice summary"
        "maintain a natural, engaging,and dynamic conversation style. The Expert should respond patiently and adjust explanations when needed"
        f"here is the outline{outline_response}"
        f"here is the role based summaries of expert and novice{rolebasedSummarization_response}"
        "the response should be json [{'speaker':'expert','text':'dialogues'},{'speaker':'novice','text':'dialogues'}] and continue"
    ]
)
    print("Dialouge generation completed")
    clean_json = dialogue_generated.text.replace("```json", "").replace("```", "").strip()
    audio_path = podcast_audio_generator.generate_podcast_audio(
        clean_json,
        space_id  # Add this parameter
    )
    if not audio_path:
        raise HTTPException(status_code=500, detail="Audio generation failed")
    audio_url = f"/podcasts/space_{space_id}/{os.path.basename(audio_path)}"

    podcast_data = {
    "space_id": space_id,
    "transcript": dialogue_generated.text,
    "audio_path": f"space_{space_id}/{os.path.basename(audio_path)}"
}
    
    try:
        db.execute(podcasts_table.insert().values(podcast_data))
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    # print(preprocessed_text)
    return {
    "status": "success",
    "data": {
        "space_id": space_id,
        "audio_url": audio_url,
        "transcript": dialogue_generated.text,
        
    }
}

@router.get("/podcast/{space_id}")
async def get_latest_podcast(space_id: str, db: Session = Depends(get_db)):
    """
    Get the most recent podcast audio URL and transcript for a specific space ID.
    """
    try:
        # Query the most recent podcast for the given space_id
        latest_podcast = db.query(
            podcasts_table
        ).filter(
            podcasts_table.c.space_id == space_id
        ).order_by(
            desc(podcasts_table.c.created_at)
        ).first()
        
        if not latest_podcast:
            return {
                "status": "success",
                "data": None,
                "message": "No podcasts found for this space"
            }
        
        # Return only the audio_url and transcript
        return {
            "status": "success",
            "data": {
                "audio_url": f"/podcasts/{latest_podcast.audio_path}",
                "transcript": latest_podcast.transcript
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving podcast: {str(e)}")