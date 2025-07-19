import { IMember } from "./member";

interface IComm {
    comm_id: number;
    comm_name: string;
    comm_desc: string;
    comm_token: string;
    comm_status: string;
    comm_owner: number;
    member: IMember[];
    status: Status;
}

interface Status 
{
    status_name:string;
}
export type {IComm};