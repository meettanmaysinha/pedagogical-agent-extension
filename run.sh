docker stop agent 
docker system prune -f
docker run --name agent  -p 8888:8888 pedagogical-agent-ext