from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.tools.wikipedia.tool import WikipediaQueryRun
from langchain_community.utilities.wikipedia import WikipediaAPIWrapper

@tool
def email_tool(task: str) -> str:
    """Useful for writing and sending a professional email. Call this when the task requires an email to be sent."""
    return f"Subject: Important Update\n\nDear Client,\n\n{task}\n\nBest regards,\nYour Company"

@tool
def linkedin_tool(task: str) -> str:
    """Useful for writing and posting LinkedIn content. Call this when the task requires a social media post on LinkedIn."""
    return f"{task}\n\n#AI #Automation #Future"

@tool
def summary_tool(task: str) -> str:
    """Useful for summarizing text. Call this when the task requires extracting key points or summarizing content."""
    return f"Summary of the task:\n{task}\n\nConclusion: This is a concise summary."

@tool
def research_tool(query: str) -> str:
    """Useful for researching current events, looking up facts, or fetching information from the web."""
    try:
        # Attempt to use Tavily for web search
        tavily = TavilySearchResults(max_results=3)
        result = tavily.invoke(query)
        if result:
            return str(result)
    except Exception:
        pass
    
    # Fallback to Wikipedia
    try:
        wiki = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
        return wiki.invoke(query)
    except Exception as e:
        return f"Research failed. Please provide more specific search terms. Error: {e}"
