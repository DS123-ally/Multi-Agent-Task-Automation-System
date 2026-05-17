def email_tool(task: str):
    return f"""
    Subject: Important Update

    Dear Client,

    {task}

    Best regards,
    Your Company
    
    """

def linkedin_tool(task:str):
    return f"""

    {task}

  ##AI #Automation #Future

    """

def summary_tool(task: str):
    return f"""
    Summary of the task:

    {task}

    Key Points:
    - Point 1
    - Point 2
    - Point 3

    Conclusion: This is a concise summary of the task.
    
    """
