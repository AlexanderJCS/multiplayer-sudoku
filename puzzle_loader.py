import sqlite3
import ast


def get_random_puzzle(difficulty: int):
    """
    Get a random puzzle from the database

    :param difficulty: The difficulty of the puzzle.
    :return: (the puzzle, puzzle solution)
    """
    conn = sqlite3.connect("puzzles.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM puzzles WHERE difficulty = ? ORDER BY RANDOM() LIMIT 1", (difficulty,))
    row = cursor.fetchone()

    conn.close()
    
    if row is None:
        raise ValueError("No puzzles found with that difficulty")

    # ast.literal_eval converts "[1, 2, 3]" to [1, 2, 3]
    return ast.literal_eval(row[1]), ast.literal_eval(row[2])
