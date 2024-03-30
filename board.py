import puzzle_loader as pl
import copy


class Board:
    def __init__(self):
        self.board, self.correct_board = pl.get_random_puzzle()
        self.original_board = copy.deepcopy(self.board)
        
        print(f"Generated board: {self.board}, Correct board: {self.correct_board}")
    
    def update_from_request(self, request) -> None:
        """
        Update the board from a request. Mutates the current board. Assumes the request is already sanitized (i.e.,
        correct data types, correct keys, etc.)
        
        :param request: A request, containing the loc and value keys
        """
        
        self.board[request["loc"]] = request["value"]
    
    def as_list_original(self):
        """
        Gets the initial board
        
        :return: A deepcopy of the initial board
        """
        
        return copy.deepcopy(self.original_board)
    
    def as_list_correct(self):
        """
        Gets the correct board
        
        :return: A deepcopy of the correct board
        """
        
        return copy.deepcopy(self.correct_board)
    
    def as_list_current(self):
        """
        Gets the board as a list datatype
        
        :return: A deepcopy of the board
        """
        
        return copy.deepcopy(self.board)
    