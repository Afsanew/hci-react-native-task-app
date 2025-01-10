import pandas as pd

# Define the steps for Story 1 and Story 2
story_1_steps = [
    "Story 1: Add phone bill to To-Do list",
    "Story 1: Generate extra tasks",
    "Story 1: Add shopping with daughter to Hobbies and share",
    "Story 1: Share lamp fixing task with husband",
    "Story 1: Adjust limits to see one task per category",
    "Story 1: Enable streak tracking and set goal to 2 days",
    "Story 1: View daily overview on homepage",
    "Story 1: Complete project report and yoga tasks",
    "Story 1: Check progress in visuals (Daughter's tasks)",
    "Story 1: Complete all tasks for today",
    "Story 1: Start a new day",
    "Story 1: Adjust hobbies for Day 2 and complete tasks",
    "Story 1: Adjust streak goal to 7 days after reaching it",
    "Story 1: View completed tasks for motivation",
    "Story 1: Check percentage of completed Hobbies tasks",
    "Story 1: Hide completed tasks",
    "Story 1: Delete all completed tasks",
    "Story 1: Complete meditation for Day 3",
    "Story 1: Start a new day without completing all tasks",
    "Story 1: Check streak high score",
    "Story 1: Sort Hobbies by shared users",
    "Story 1: Create shared category 'Baby' with husband",
    "Story 1: Delete shopping task for daughter",
    "Story 1: Delete all app data"
]

story_2_steps = [
    "Story 2: Generate extra tasks",
    "Story 2: Add task for monthly budget review",
    "Story 2: Share yoga task with daughter",
    "Story 2: Enable streak tracking with a goal of 3 days",
    "Story 2: Check daily overview",
    "Story 2: Complete reading task and workout task",
    "Story 2: Check visuals for son's mental load",
    "Story 2: Adjust hobbies for Day 2 and complete tasks",
    "Story 2: Start a new day",
    "Story 2: View completed tasks for motivation",
    "Story 2: Adjust streak goal to 5 days after achieving it",
    "Story 2: Delete completed Hobbies tasks",
    "Story 2: Add travel itinerary task and share it",
    "Story 2: Start a new day without completing all tasks",
    "Story 2: Sort Household by deadlines",
    "Story 2: Check percentage of completed Work tasks",
    "Story 2: Delete travel itinerary task",
    "Story 2: Create a new shared category with the family",
    "Story 2: Add a shopping list to Household",
    "Story 2: Check streak progress and high score"
]

# Combine all columns for Story 1 and Story 2
columns = [
    "Task ID", "Task Name", "Story Name",
    "Time Taken (s)", "Errors", "Comments"
]

# Create rows for each step in the stories
rows = [
    {"Task ID": idx + 1, "Task Name": step, "Story Name": "Story 1", "Time Taken (s)": "", "Errors": "", "Comments": ""}
    for idx, step in enumerate(story_1_steps)
] + [
    {"Task ID": len(story_1_steps) + idx + 1, "Task Name": step, "Story Name": "Story 2", "Time Taken (s)": "", "Errors": "", "Comments": ""}
    for idx, step in enumerate(story_2_steps)
]

# Create a DataFrame from rows
data = pd.DataFrame(rows)

# Save to an Excel file
output_path = "StoryMeasurements.xlsx"
data.to_excel(output_path, index=False)

print(f"Excel file '{output_path}' created successfully!")
