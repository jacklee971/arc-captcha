import os
import arc_agi

def main():
    port = int(os.environ.get("PORT", 8001))
    host = os.environ.get("HOST", "0.0.0.0")

    arc = arc_agi.Arcade()
    arc.listen_and_serve(host=host, port=port)

if __name__ == "__main__":
    main()
