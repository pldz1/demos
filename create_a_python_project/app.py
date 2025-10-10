import os
import sys
import platform


def main() -> None:
    '''The main function of the project.
    '''
    # Get project directory.
    projectPath = os.path.dirname(os.path.abspath(__file__))
    platformInfo = platform.platform()

    # Add the build path into python system environment.
    if "Windows" in platformInfo:
        # Be carefully! If you use append, it may not work!
        sys.path.insert(0, projectPath+'/build')
        print(sys.path)
        runApp()
    else:
        print("[ ERROR ] The project doesn't support this platform")
        exit(0)

def runApp() -> None:
    '''This function is to run the project.
    '''
    from flask import Flask, render_template

    # Set the path for static resource.
    app = Flask(__name__, template_folder="./resources",
                static_url_path="", static_folder="./resources")

    # Mount the static html page for the server.
    @app.route('/')
    def index():
        return "Hello World!"

    # Run flask web server on port 5000.
    app.run(host="0.0.0.0", port=5000)


if __name__ == '__main__':
    main()
