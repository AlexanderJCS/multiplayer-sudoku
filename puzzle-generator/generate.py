"""
This file is meant to be the main entry point for the puzzle generator. It will write to a SQLite database that will
be used by the Flask app to serve puzzles to the user. The database will have a table with the following columns:
    - puzzle: TEXT, a python-formatted list of integers representing the puzzle
    - solution: TEXT, a python-formatted list of integers representing the solution to the puzzle
"""

import sqlite3
import time

from sudoku_board import Board


def create_table(cursor):
    """
    Create the table in the database

    :param cursor: The cursor object to use
    """
    cursor.execute("CREATE TABLE IF NOT EXISTS puzzles (puzzle TEXT, solution TEXT)")


def add_row(cursor, puzzle: list[int], solution: list[int]):
    """
    Add a row to the database

    :param cursor: The cursor object to use
    :param difficulty: The difficulty of the puzzle.
    :param puzzle: The puzzle
    :param solution: The solution to the puzzle
    """
    cursor.execute("INSERT INTO puzzles VALUES (?, ?)", (str(puzzle), str(solution)))


def flatten(arr: list[list[int]]) -> list[int]:
    """
    Flatten a 2D array into a 1D array

    :param arr: The 2D array to flatten
    :return: The flattened array
    """
    return [item for sublist in arr for item in sublist]


def generate_puzzles(num_puzzles, conn, cursor):
    """
    Generate puzzles and add them to the database

    :param num_puzzles: The number of puzzles to generate
    :param conn: The database connection object to use
    :param cursor: The database cursor object to use
    """
    
    board = Board()
    
    for i in range(num_puzzles):
        print(f"Generating puzzle {i + 1} / {num_puzzles}: {i / num_puzzles * 100:.2f}%")
        
        board.clear()
        solution = board.generate()

        add_row(cursor, flatten(board.board), flatten(solution))
        conn.commit()


def main():
    print("""
This program will generate Sudoku puzzles and append them to an SQLite database named puzzles.db.
The database file may be moved to the repository's root directory to be used by the Flask app.

This may take a while to run depending on your system, depending on CPU speed, memory size, and number of puzzles.
On my system (Intel i7-12700KF, 16 GB DDR4 RAM), it took about 45 seconds to generate 10 puzzles
    """)
    
    num_puzzles = int(input("Enter the number of puzzles to generate: "))
    
    start = time.time()
    conn = sqlite3.connect("puzzles.db")
    cursor = conn.cursor()
    create_table(cursor)
    conn.commit()
    
    generate_puzzles(num_puzzles, conn, cursor)
    conn.commit()
    
    conn.close()
    
    print(f"Completed in {time.time() - start:.2f} seconds. See the database at ./puzzles.db.")


if __name__ == "__main__":
    main()
