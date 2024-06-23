import tomllib
import logging


def gen_logger():
    logger = logging.getLogger("sudoku")
    logger.setLevel(logging.INFO)
    
    handler = logging.FileHandler("sudoku.log")
    handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(handler)
    
    logger.info("Created logger!")
    
    return logger


with open("config.toml", "rb") as f:
    CONFIG = tomllib.load(f)

LOGGER = gen_logger()
