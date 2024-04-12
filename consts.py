import tomllib

with open("config.toml", "rb") as f:
    CONFIG = tomllib.load(f)
