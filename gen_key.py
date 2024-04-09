import secrets


def gen_key():
    return secrets.token_hex(32)


def main():
    print("Generating secret key...")
    
    with open("secret_key.txt", "w") as f:
        f.write(gen_key())
    
    print("Secret key generated and saved to secret_key.txt")


if __name__ == "__main__":
    main()
