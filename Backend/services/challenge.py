import random

# Expanded list of challenge phrases for voice verification
CHALLENGES = [
    "Say 35 green apples",
    "Repeat 42 orange balloons", 
    "I like yellow bananas",
    "My voice is my passport",
    "Open the red umbrella",
    "The sun sets at 6 PM",
    "Blue sky above the mountains",
    "Coffee tastes better in the morning",
    "Technology changes rapidly",
    "Music brings people together",
    "Reading is a wonderful hobby",
    "Exercise keeps you healthy",
    "Friendship is very important",
    "Learning never stops",
    "Nature is beautiful and peaceful",
    "Cooking can be very relaxing",
    "Travel broadens the mind",
    "Art expresses human creativity",
    "Science explains the world",
    "Kindness makes the world better"
]

def get_random_phrase():
    """
    Returns a random challenge phrase for voice verification.
    
    Returns:
        str: A random phrase from the challenge list
    """
    return random.choice(CHALLENGES)
