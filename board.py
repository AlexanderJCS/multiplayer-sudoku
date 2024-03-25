

class Board:
    def __init__(self):
        self.correct_board = [1] * 81
        self.board = [0] * 81
    
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
    