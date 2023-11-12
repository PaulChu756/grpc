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

function main() {
    // Simple error catching
    if (process.argv.length < 4) {
        return console.log('Usage: make client-node ARGS="whohas <word>"');
    }

    // Parse user's argument
    var arg = process.argv.slice(2);
    var func;
    var word;
    var threshold = 1; // Default threshold

    // Determine which function user's calling
    switch (arg[0]) {
        case 'whohas':
            func = 'Whohas';
            word = arg[1];
            break;
        case 'whohas2':
            func = 'Whohas2';
            word = arg[1];
            if (arg.length === 3) {
                threshold = parseInt(arg[2]);
                if (isNaN(threshold)) {
                    console.log('Threshold must be a number.');
                    process.exit(1);
                }
            }
            break;
        default:
            console.log('\nUsage: make client-node ARGS="whohas <word>"\n');
            process.exit(1);
    }

    // Create the client stub
    const client = new keysearchProto.KeywordSearch(SOCKET, grpc.credentials.createInsecure());
    const request = { word: word, threshold: threshold }; // Always set threshold

    console.log(`Calling ${func} with word: ${word} and threshold: ${threshold}`);

    client[func](request, (err, response) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(response.Results);
        process.exit(0);
    });
}

main();
