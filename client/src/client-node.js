const PROTO_PATH = __dirname + '/../../protos/keysearch/proto/keysearch.proto';
// IP Address + Port #
const SOCKET = 'localhost:50051';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Some options for loading .proto file
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

// Load the .proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
// Load the proto package 'proto.keysearch' into constant keysearchProto
// This allows keysearchProto to recognize all of the definitions in the .proto file
const keysearchProto = grpc.loadPackageDefinition(packageDefinition).proto.keysearch;

function main(){
    // Simple error catching
    if(process.argv[3 === undefined]){
        return console.log('Usage: make client-node ARGS="whohas <word>"');
    }

    // Parse user's argument
    var arg = process.argv.slice(2);
    var func;
    // Argument collecting is primitive in current state
    var word = arg[1];
    
    // Determine which function user's calling
    switch(arg[0]){
        case 'whohas':
            func = 'Whohas';
            break;
        default:
            console.log('\nUsage: make client-node ARGS="whohas <word>"\n');
            process.exit(1);
    };

    // Create the client stub
    // This allows us to call the 'Whohas' function defined in the 'KeywordSearch' service
    // Additionally, send requests to port 50051
    const client = new keysearchProto.KeywordSearch(SOCKET, grpc.credentials.createInsecure());
    // Finally, call the function
    client[func]({word: word}, (err, response) => {
        console.log(response.Results);
        process.exit(0);
    });
};

main();
