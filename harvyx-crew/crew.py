from crewai import Crew, Process
from agents import researcher_agent, planner_agent, concierge_agent
from tasks import research_task, planning_task, concierge_task

def run_harvyx_crew(request: str, traveller_profile: dict = None) -> str:
    if traveller_profile is None:
        traveller_profile = {}

    researcher = researcher_agent()
    planner = planner_agent()
    concierge = concierge_agent()

    crew = Crew(
        agents=[researcher, planner, concierge],
        tasks=[
            research_task(researcher, request, traveller_profile),
            planning_task(planner, request),
            concierge_task(concierge, request, traveller_profile),
        ],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    return str(result)
