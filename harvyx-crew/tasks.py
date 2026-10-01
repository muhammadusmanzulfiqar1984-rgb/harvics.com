from crewai import Task

def research_task(agent, request: str, traveller_profile: dict):
    profile_str = (
        f"Name: {traveller_profile.get('name', 'Guest')}, "
        f"Preferences: {traveller_profile.get('preferences', 'luxury, private, exclusive')}, "
        f"Budget: {traveller_profile.get('budget', 'ultra-premium')}"
    )
    return Task(
        description=(
            f"Research the following travel request thoroughly:\n\n"
            f"REQUEST: {request}\n\n"
            f"TRAVELLER PROFILE: {profile_str}\n\n"
            "Find: best flights or transfer options, top 3 hotel recommendations with "
            "rates, dining options, key experiences or activities, and any important "
            "logistics (visa, weather, local tips). Be specific — names, prices where "
            "known, booking lead times."
        ),
        expected_output=(
            "A detailed research brief: flights/transfers, 3 hotel options with "
            "descriptions and approximate rates, dining recommendations, 3-5 curated "
            "experiences, and logistics notes."
        ),
        agent=agent,
    )

def planning_task(agent, request: str):
    return Task(
        description=(
            f"Using the research brief, create a complete day-by-day luxury itinerary "
            f"for: {request}\n\n"
            "Include: arrival/departure logistics, daily schedule with timings, "
            "hotel check-in/out, restaurant reservations, activities, transfers between "
            "venues, and one contingency option per day."
        ),
        expected_output=(
            "A structured day-by-day itinerary with times, venues, transfer notes, "
            "and one contingency per day."
        ),
        agent=agent,
    )

def concierge_task(agent, request: str, traveller_profile: dict):
    name = traveller_profile.get("name", "")
    greeting = f"for {name}" if name else ""
    return Task(
        description=(
            f"Synthesise the research and itinerary into a polished, client-ready "
            f"travel proposal {greeting} for: {request}\n\n"
            "Write in the warm, confident voice of HARVYX. Lead with the headline "
            "experience, present the itinerary elegantly, highlight two or three "
            "standout moments, and close with a concierge offer to refine any detail."
        ),
        expected_output=(
            "A beautifully written, client-ready travel proposal in markdown. "
            "Warm, luxurious tone. Clear structure: overview, day-by-day, standout "
            "moments, next steps."
        ),
        agent=agent,
    )
