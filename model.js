import { pipeline } from '@xenova/transformers';

class NeodemiaPipeline {
    static task = 'text2text-generation';
    static model = 'Xenova/flan-t5-base';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

const clean_output = (text) => {
    return text.replace(/http\S+/g, '').replace(/\s+/g, ' ').trim();
};

export async function init(progressCallback) {
    await NeodemiaPipeline.getInstance(progressCallback);
}

export async function generate(options) {
    const { query, gen_length, temperature, top_p, beams, isExplain, previousAnswer } = options;

    const generator = await NeodemiaPipeline.getInstance();
    
    let prompt;
    if (isExplain) {
        prompt = `Explain further in detail: ${previousAnswer}\nDetailed explanation:`;
    } else {
        prompt = `You are a world-class chemistry professor renowned for your precision and clarity. Provide a detailed and factually correct explanation of the following question. Your answer should include: a clear definition, a description of the underlying scientific mechanism, a discussion of any key physical or chemical properties, and conclude with a brief summary. Ensure that your explanation is coherent, non-repetitive, and free of extraneous commentary.\n\nQuestion: ${query}\nAnswer:`;
    }

    const output = await generator(prompt, {
        max_length: gen_length,
        min_length: Math.min(64, gen_length),
        temperature: temperature,
        top_p: top_p,
        num_beams: beams,
        early_stopping: true,
        no_repeat_ngram_size: 3,
        repetition_penalty: 1.2,
        length_penalty: 1.0,
    });
    
    const resultText = output[0].generated_text;
    return clean_output(resultText);
}

