import { Interaction } from "../model/InteractionChatSchema";
import InteractionChat from "../model/InteractionChatSchema";

const createQuery = async(req, res)=>{
    const {query,parentId} = req.body;
    try {
        request.post({
            url: 'http://127.0.0.1:5000/document/query',
            json: { query: query, dbName }
        }, async (error, response, body) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send('Internal Server Error');
            }
            console.log(body)
            try {
                const conversationId= await Conversation.findOne({dbName:dbName},{_id:1});
                console.log("conversationId ",conversationId)
                let message = await Message.create({ conversationId:conversationId._id, question:query, response:body.response,parentId });
                console.log("Filled message is: ", message);

                if(parentId===null){
                    conversationId.rootId = message._id;
                    conversationId.save();
                } else{
                    const parentMessage = await Message.findById({_id:parentId});
                    parentMessage.children.push(message._id);
                    await parentMessage.save();
                }
                res.status(200).send(message);
            } catch (err) {
                res.status(500).send('Error saving to database');
            }
        });
    } catch (error) {
        
    }
}