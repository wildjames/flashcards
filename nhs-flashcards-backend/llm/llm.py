import os
import openai



def get_incorrect_answer(question, correct_answer):
    """
    Generate two incorrect answers for a given question and correct answer using OpenAI's API.

    Args:
        question (str): The question to be answered.
        correct_answer (str): The correct answer to the question.

    Returns:
        list: A list containing two incorrect answers.
    """

    # Ensure environment variables for API key, organization, and project ID are set
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_ORGANIZATION = os.getenv('OPENAI_ORGANIZATION')
    OPENAI_PROJECT_ID = os.getenv('OPENAI_PROJECT_ID')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL')

    if not OPENAI_API_KEY:
        raise EnvironmentError("OPENAI_API_KEY environment variable is not set.")
    if not OPENAI_ORGANIZATION:
        raise EnvironmentError("OPENAI_ORGANIZATION environment variable is not set.")
    if not OPENAI_PROJECT_ID:
        raise EnvironmentError("OPENAI_PROJECT_ID environment variable is not set.")
    if not OPENAI_MODEL:
        raise EnvironmentError("OPENAI_MODEL environment variable is not set.")

    # Set up OpenAI API client
    client = openai.OpenAI(
        api_key=OPENAI_API_KEY,
        organization=OPENAI_ORGANIZATION,
        project=OPENAI_PROJECT_ID,
    )

    # Craft the prompt to generate incorrect answer
    prompt = [
        {
            "content": (
                f"Generate one plausible but incorrect answer to the following question. Return absolutley no other text, but the single answer.\n\n"
                f"Question: {question}\n"
                f"Correct Answer: {correct_answer}\n"
                f"Incorrect Answer:"
            ),
            "role": "system"
        }
    ]

    try:
        # Call OpenAI API to generate responses
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=prompt,
            max_tokens=100,
            temperature=0.7,
            n=1,  # Generate a single completion
        )

        # Extract the text from the API response
        incorrect_answer = response.choices[0].message.content

        # Split the response into individual answers
        return incorrect_answer.strip()

    except Exception as e:
        print(f"An error occurred while generating incorrect answers: {e}")
        return []

# Example usage
if __name__ == "__main__":
    question = "What does CPT stand for?"
    correct_answer = "Clinical Prescription Tracker"
    incorrect_answers = get_incorrect_answer(question, correct_answer)

    print("Generated Incorrect Answers:")
    for idx, answer in enumerate(incorrect_answers, start=1):
        print(f"{idx}. {answer}")
