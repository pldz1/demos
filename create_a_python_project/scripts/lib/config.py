import os


class Configure():
    def __init__(self) -> None:
        '''
        config.py is Non-modifiable variable values stored inside the project.
        Using the define of class, it's easy for compiler to promote.

        - Note: For the description of the local path, the attribute name must start with 'local_',
        and the last character of the string of the path does not add '/',
        and all paths need to be used in conjunction with 'project path'.
        '''
        self.ID = '4'
        self.local_resource = '/resources'
        self.getAllLocalAbstractPath()

    def getAllLocalAbstractPath(self) -> None:
        '''Before using the configuration, the python should make all local paths absolute.
         We agree that variables for local paths must start with 'local_'.
        '''
        projectPath = os.path.abspath(__file__)

        # Get the projec
        for _ in range(3):
            projectPath = os.path.dirname(projectPath)

        for attr in self.__dict__:
            if 'local_' in attr:
                self.__dict__[attr] = projectPath + self.__dict__[attr]
