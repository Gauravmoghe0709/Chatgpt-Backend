
const { Pinecone } = require('@pinecone-database/pinecone')


const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const chatgpt = pc.Index("chatgpt-clone")     // create a index in pinecode 

async function vectormemory({vectors,metadata,messageid}){
    
    await chatgptcloneindex.upsert([{

        id:messageid,
        values:vectors,
        metadata,
    }])
}

