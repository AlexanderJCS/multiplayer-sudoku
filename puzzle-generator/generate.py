"""
This file is meant to be the main entry point for the puzzle generator. It will write to a SQLite database that will
be used by the Flask app to serve puzzles to the user. The database will have a table with the following columns:
    - difficulty: INTEGER, the difficulty of the puzzle
    - puzzle: TEXT, a python-formatted list of integers representing the puzzle
    - solution: TEXT, a python-formatted list of integers representing the solution to the puzzle
"""

import sqlite3
from sudoku_board import Board


def create_table(cursor):
    """
    Create the table in the database

    :param cursor: The cursor object to use
    """
    cursor.execute("CREATE TABLE IF NOT EXISTS puzzles (difficulty INTEGER, puzzle TEXT, solution TEXT)")


def add_row(cursor, difficulty: int, puzzle: list[int], solution: list[int]):
    """
    Add a row to the database

    :param cursor: The cursor object to use
    :param difficulty: The difficulty of the puzzle.
    :param puzzle: The puzzle
    :param solution: The solution to the puzzle
    """
    cursor.execute("INSERT INTO puzzles VALUES (?, ?, ?)", (difficulty, str(puzzle), str(solution)))


def flatten(arr: list[list[int]]) -> list[int]:
    """
    Flatten a 2D array into a 1D array

    :param arr: The 2D array to flatten
    :return: The flattened array
    """
    return [item for sublist in arr for item in sublist]


def generate_puzzles(cursor):
    """
    Generate puzzles and add them to the database

    :param cursor: The database cursor object to use
    """
    
    b = Board()
    
    num_puzzles = 1
    for i in range(num_puzzles):
        print(f"Generating puzzle {i + 1} / {num_puzzles}: {i / num_puzzles * 100:.2f}%")
        
        b.clear()
        puzzles, solution = b.generate([150, 350, 500])
        
        flat_solution = flatten(solution)
        
        for difficulty, puzzle in puzzles.items():
            add_row(cursor, difficulty, flatten(puzzle), flat_solution)


def main():
    conn = sqlite3.connect("puzzles.db")
    cursor = conn.cursor()
    create_table(cursor)
    conn.commit()
    
    generate_puzzles(cursor)
    conn.commit()
    
    conn.close()


if __name__ == "__main__":
    main()
