export interface VedicVerse {
    id: string,
    veda: string,
    mandala: number,
    sukta: number,
    verse: number,
    deity: string,
    sanskrit: string,
    transliteration: string,
    translation: string
}

export interface OllamaGenerateRequest{
    model: string,
    prompt: string,
    system?:string,
    stream: boolean
}

export interface OllamaGenerateResponse{
    model: string,
    created_at: string,
    response: string,
    done: boolean,
    total_duration?: number,
    eval_count?: number
}