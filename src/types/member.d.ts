import { IGift } from "./gift";

interface IMember {
    mem_id: number;
    mem_name: string;
    comm_id: number;
    comm_name: string;
    comm_status: string;
    gift_created: boolean;
    gift_reference: boolean;
    comm_status: string;
    gift_letter: string;
    gift_desc: string;
    gift_for: number;
    gift: IGift[];
}
export type {IMember};