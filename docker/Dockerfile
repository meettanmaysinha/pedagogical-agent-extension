# A dockerfile must always start by importing the base image.
# We use the keyword 'FROM' to do that.
# In our example, we want import the python image.
# So we write 'python' for the image name and 'latest' for the version.
# FROM python:3.11
FROM quay.io/jupyter/datascience-notebook

# Set the working directory in the container
WORKDIR /usr/src/app

# Install pre-requisite package from stickyland
RUN pip install stickyland

# Copy all source files from the host to the container
COPY ../ ./

# Install Jupyter Lab (v3.6.7)
RUN pip install jupyterlab==3.6.7

# Install dependencies 
RUN pip install -e .

# # Rebuild extension Typescript source after making changes
# RUN jlpm run build

# We need to define the command to launch when we are going to run the image.
# We use the keyword 'CMD' to do that.
# The following command will execute "python ../streammain.py".
CMD [ "jlpm", "run", "watch" ]

CMD [ "jupyter", "lab" ]

# Run this in Command Line to build: 
# docker build -f docker/Dockerfile -t pedagogical-agent-ext .

# Run this in Command Line to run image:
# docker run -it pedagogical-agent-ext