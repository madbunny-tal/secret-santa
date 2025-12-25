interface IGift {
    gift_id: number;
    gift_desc: string;
    is_ref: boolean;
    is_res: boolean;
    gift_for: number;
    gift_by: number;
    gift_letter: string;
}
export type {IGift};