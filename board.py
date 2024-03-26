import puzzle_loader as pl


class Board:
    def __init__(self):
        self.board, self.correct_board = pl.get_random_puzzle()
        
        print(f"Generated board: {self.board}, Correct board: {self.correct_board}")
    
    def update_from_request(self, request) -> None:
        """
        Update the board from a request. Mutates the current board. Assumes the request is already sanitized (i.e.,
        correct data types, correct keys, etc.)
        
        :param request: A request, containing the loc and value keys
        """
        
        self.board[request["loc"]] = request["value"]
    
    def as_list_correct(self):
        """
        Gets the correct board
        
        :return: A deepcopy of the correct board
        """
        
        return list(self.correct_board)
    
    def as_list(self):
        """
        Gets the board as a list datatype
        
        :return: A deepcopy of the board
        """
        
        return list(self.board)
    