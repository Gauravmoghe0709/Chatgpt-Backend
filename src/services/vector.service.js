
const { Pinecone } = require('@pinecone-database/pinecone')


const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const chatgpt = pc.Index("chatgpt-clone")     // create a index in pinecode 

async function createvectormemory({vectors,metadata,messageid}){   // this function is use to create a memory in pinecone database
    await chatgpt.upsert([{
        id:messageid,
        values:vectors,
        metadata,
    }])
}

async function querymemory({queryvector,limit=5,metadata}){
    
    const data = await chatgpt.query({
        vector : queryvector,
        topK: limit,
        filter: metadata ?{metadata}: undefined,
        includeMetadata: true
    })

    return data.matches
}


module.exports = {
    createvectormemory,
    querymemory
}
