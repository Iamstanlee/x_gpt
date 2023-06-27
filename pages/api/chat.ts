import {NextApiRequest, NextApiResponse} from 'next';
import {Configuration, OpenAIApi as OpenAI} from 'openai';
import {deserialize} from "@/utils/deserialize";


const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY
});

const openai = new OpenAI(configuration);


export enum OpenAIRole {
    system = 'system',
    assistant = 'assistant',
    user = 'user',
}

export interface Message {
    id: string;
    text: string;
    sent_at?: number;
    is_typing?: boolean;
    role: OpenAIRole;
    is_code?: boolean;
}

interface Props {
    text?: string;
    error?: string;
    is_not_done_typing?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Props>) {
    const messages: Message[] = deserialize(req.body);
    const response = await openai.createChatCompletion({
            messages: messages.map((msg) => {
                return {
                    'role': msg.role,
                    'content': msg.text,
                }
            }),
            model: openAIConfig.model,
            temperature: openAIConfig.temperature,
            max_tokens: openAIConfig.max_token,
            n: openAIConfig.number_of_completion,
        }
    );
    if (response.status == 200) {
        return res.status(200).json({
            text: response.data.choices[0].message?.content ?? '-',
            is_not_done_typing: response.data.choices[0].finish_reason !== 'stop'
        });
    } else {
        return res.status(500).json({error: response.statusText});
    }

}


type OpenAIConfig = {
    model: string;
    temperature: number;
    max_token: number;
    number_of_completion: number;
}

const openAIConfig: OpenAIConfig = {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_token: 512,
    number_of_completion: 1,
};
