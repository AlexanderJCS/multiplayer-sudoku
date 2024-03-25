import random
import copy


class Board:
    def __init__(self):
        self.board = [[0 for _ in range(9)] for _ in range(9)]
    
    def generate(self, difficulties: list[int]) -> tuple[dict[int, list[list[int]]], list[list[int]]]:
        """
        Mutates the board to have the highest difficulty of the given difficulties.

        :param difficulties: The difficulties to return for a given board. Higher values are harder.
        :return (A dictionary of the difficulties as the key and the puzzle as the value,
                 the solution to the board with the given difficulties)
        """
        
        self.solve(rand_gen=True)
        solution = copy.deepcopy(self.board)
        puzzles_by_difficulty = {}
        
        for i in range(max(difficulties)):
            if i % 10 == 0:
                print(f"Progress: {100 * i / max(difficulties):.2f}%")
            
            x = -1
            y = -1
            
            original = 0
            
            while original == 0:
                y = random.randint(0, len(self.board) - 1)
                x = random.randint(0, len(self.board[y]) - 1)
                original = self.board[y][x]
            
            self.board[y][x] = 0
            
            if not self.has_one_solution():
                self.board[y][x] = original
            
            if i + 1 in difficulties:
                puzzles_by_difficulty[i + 1] = (copy.deepcopy(self.board))
        
        return puzzles_by_difficulty, solution
        
    def has_one_solution(self):
        """
        Checks if the board has exactly one solution. Does not mutate the board.

        :return: True if the board has exactly one solution, False otherwise
        """
        
        board_copy = copy.deepcopy(self.board)
        solutions = 0
        
        for step in self._solve_generator():
            # filter out incomplete steps
            if any(step[i][j] == 0 for i in range(9) for j in range(9)):
                continue
            
            solutions += 1
            if solutions > 1:
                self.board = board_copy
                return False
        
        self.board = board_copy
        return True
    
    def _solve_generator(self):
        """
        A generator that yields each step of the solution. WARNING: mutates the board

        :return: A generator that yields the board at each step
        """
        
        # honestly no idea how this code works github copilot generated it lmao
        for y, row in enumerate(self.board):
            for x, cell in enumerate(row):
                if cell != 0:
                    continue
                
                for num in range(1, 10):
                    if self.is_valid(x, y, num):
                        self.board[y][x] = num
                        yield self.board
                        yield from self._solve_generator()
                        self.board[y][x] = 0
                
                return
    
    def solve(self, rand_gen=False):
        """
        Mutates this board to solve the sudoku puzzle

        :param rand_gen: If the puzzle has multiple solutions, whether to randomly choose a solution or always have
                            the same one. Used for generating puzzles
        :return: True if the board was solved, False otherwise
        """
        
        for y, row in enumerate(self.board):
            for x, cell in enumerate(row):
                if cell != 0:
                    continue
                
                order = list(range(1, 10))
                
                if rand_gen:
                    random.shuffle(order)
                
                for num in order:
                    if self.is_valid(x, y, num):
                        self.board[y][x] = num
                        
                        if self.solve(rand_gen=rand_gen):
                            return True
                        
                        self.board[y][x] = 0
                
                return False
        
        return True
    
    def get_subsquare(self, x, y) -> list[int]:
        """
        :param x: The x coordinate of the cell
        :param y: The y coordinate of the cell
        :return: A flat array of all items in the subsquare from top left to bottom right
        """
        
        x_start = (x // 3) * 3
        y_start = (y // 3) * 3
        
        return [
            self.board[y][x]
            for y in range(y_start, y_start + 3)
            for x in range(x_start, x_start + 3)
        ]
    
    def is_valid(self, x, y, num) -> bool:
        in_row = num in self.board[y]
        
        if in_row:
            return False
        
        in_col = num in [row[x] for row in self.board]
        
        if in_col:
            return False

        return num not in self.get_subsquare(x, y)
    
    def clear(self):
        self.board = [[0 for _ in range(9)] for _ in range(9)]
    
    def __str__(self):
        board_str = ""
        
        for y, row in enumerate(self.board):
            for x, cell in enumerate(row):
                # Add the cell value
                board_str += str(cell)
                
                # Add vertical line
                if (x + 1) % 3 == 0 and x != len(row) - 1:
                    board_str += " | "
                else:
                    board_str += " "
            
            # Add the newline
            board_str += "\n"
            
            # Add horizontal line
            if (y + 1) % 3 == 0 and y != len(self.board) - 1:
                board_str += "-" * (9 * 2 + len(row) // 3)
                board_str += "\n"
        
        return board_str
