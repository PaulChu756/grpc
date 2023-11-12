import logging
import os
from concurrent import futures

import grpc
from grpc_reflection.v1alpha import reflection
from keysearch.proto import keysearch_pb2_grpc, keysearch_pb2
from typing import Text


fakedatabase={} #assume this is a database of index files...
def popdatabase(filepath):
    if(not os.path.exists(filepath)):
        logging.exception("index file not found")
    with open(filepath, "r") as f:
        for line in f:
            lsplit=line.strip().split("|.|")
            filename=lsplit[0]
            fakedatabase[filename]=[]
            wordcount=int((len(lsplit)-1)/2)
            #print(f"{filename}:{wordcount}")
            for i in range(wordcount):
                fakedatabase[filename].append( (lsplit[(i*2)+1],int(lsplit[(i+1)*2])) )
    #print(fakedatabase)

class Server(keysearch_pb2_grpc.KeywordSearchServicer):
    

    def Whohas(self, request: keysearch_pb2.Query, context):
        logging.info(request)
        logging.info(context)
        #get input from request
        queryword=request.word
        mincount=1 # minimum number of word occurence to return into the result (integer 1)

        #prepare result
        response: keysearch_pb2.RepeatedResult = keysearch_pb2.RepeatedResult()
        if(queryword in fakedatabase.keys()):
            for filename,i_count in fakedatabase[queryword]:
                if(i_count>=mincount):
                    response.Results.append(keysearch_pb2.Result(word=queryword,file=filename,count=i_count))
        return response


    def Whohas2(self, request: keysearch_pb2.Query, context):
        logging.info(request)
        logging.info(context)

        query_word = request.word
        threshold = request.threshold

        response: keysearch_pb2.RepeatedResult = keysearch_pb2.RepeatedResult()

        if query_word in fakedatabase.keys():
            for filename, count in fakedatabase[query_word]:
                if count >= threshold:
                    response.Results.append(keysearch_pb2.Result(word=query_word, file=filename, count=count))
        
        return response
    
def _serve(port: Text):
    bind_address = f"[::]:{port}"
    server = grpc.server(futures.ThreadPoolExecutor())
    keysearch_pb2_grpc.add_KeywordSearchServicer_to_server(Server(), server)
    server.add_insecure_port(bind_address)
    server.start()
    logging.info("Listening on %s.", bind_address)
    server.wait_for_termination()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    _PORT = os.environ["SERVER_GRPC_PORT"]
    #_PORT = "58001"
    print(f"PORT={_PORT}")
    popdatabase("./server/db/index.txt")
    _serve(_PORT)