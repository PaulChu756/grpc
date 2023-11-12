const PROTO_PATH = __dirname + '/../../protos/keysearch/proto/keysearch.proto';
const SOCKET = 'localhost:50051';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const keysearchProto = grpc.loadPackageDefinition(packageDefinition).proto.keysearch;

function main() {
    if (process.argv.length < 4) {
        return console.log('Usage: make client-node ARGS="whohas <word>" or "whohas2 <word> <threshold>"');
    }

    var arg = process.argv.slice(2);
    var func;
    var word = arg[1];

    switch (arg[0]) {
        case 'whohas':
            func = 'Whohas';
            break;
        case 'whohas2':
            func = 'Whohas2';
            break;
        default:
            console.log('\nUsage: make client-node ARGS="whohas <word>" or "whohas2 <word> <threshold>"\n');
            process.exit(1);
    }

    if (func === 'Whohas2') {
        // Check if enough arguments are provided for 'whohas2'
        if (arg.length !== 4) {
            console.log('Usage: make client-node ARGS="whohas2 <word> <threshold>"');
            process.exit(1);
        }

        // Parse the threshold value
        var threshold = parseInt(arg[3]);
        if (isNaN(threshold)) {
            console.log('Threshold must be a number.');
            process.exit(1);
        }
    }

    const client = new keysearchProto.KeywordSearch(SOCKET, grpc.credentials.createInsecure());
    const request = { word: word };

    if (func === 'Whohas2') {
        // Check if enough arguments are provided for 'whohas2'
        if (arg.length !== 4) {
            console.log('Usage: make client-node ARGS="whohas2 <word> <threshold>"');
            process.exit(1);
        }
    
        // Parse the threshold value
        var threshold = parseInt(arg[3]);
        if (isNaN(threshold)) {
            console.log('Threshold must be a number.');
            process.exit(1);
        }
    }
    

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
