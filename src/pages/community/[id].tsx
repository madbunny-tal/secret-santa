import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import supabase from "@/lib/db";
import type { IMember } from "@/types/member";
import { FormEvent, useEffect, useState } from "react";
import Image from 'next/image';
import { Ellipsis} from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter,  DialogDescription, DialogTitle, DialogClose  } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { IComm } from "@/types/comm";
import { IGift } from "@/types/gift";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage,BreadcrumbSeparator} from "@/components/ui/breadcrumb"

const imgUrl = 'https://mqichvjbjuhwmbtpnklj.supabase.co/storage/v1/object/public/images/';
const CommunityPage =  () => {
    const [member, setMember] = useState<IMember[]>([]); 
    const [comm, setComm] = useState<IComm>();         
    const [createDialog, setCreateDialog] = useState(false);
    const [memberDialog, setMemberDialog] = useState(false);
    const [startDialog, setStartDialog] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [memToken, setMemToken] = useState('');
    const [memActive, setMemActive] = useState<IMember|null>();
    const [selectedMember, setSelectedMember] = useState<{
        member: IMember;
        action: 'edit' | 'delete';
    } | null>(null);
    const [reveal, setReveal] = useState<{
        mem_id: number;
        value: boolean;
    }[]>([]); 
    
    
    const router = useRouter();
    const goToMem = (path:string) => {
        window.open('/member/'+path);        
    }
    const fetchComm = async () => {
        if (router.query.id)
        {
            const token = router.query.id + "";                
            const {data, error} = await supabase.from("community")
                .select("*, member(mem_id, mem_name, gift(gift_id, gift_desc, is_ref, is_res, gift_for, gift_by, gift_letter)), comm_status, status(status_name)")
                .eq("comm_token", token.toUpperCase()).single();     
            if (error) {
            console.log("error: ", error)   ;
            }
            else {
                if (data)
                {
                    setComm(data);
                    if (data.comm_status != "CR") {
                        const gifts = data.member.map((x:IMember) => x.gift);
                        const memList = data.member.map((mem:IMember) => ({...mem, gift_created:(gifts.filter((gift:IGift[])=>gift[0].gift_by == mem.mem_id ))[0][0].is_res}));
                        setMember(memList);
                        setReveal(data.member.map((x:{
                            mem_id: number;
                            value: boolean;
                        }) => ({ mem_id:x.mem_id, value:false})));       
                        console.log(reveal);          
                    }
                    else
                    {
                        setMember(data.member);    
                    }
                }
            }    
        }
    }
    
    useEffect(() =>
    {   
        if (!router.isReady) return;
        console.log(router.query.id);        
        fetchComm();        
    }, [router.isReady]);

    const handleStart = async () => {
        alert('started');
        if (comm && comm.member.length> 0) {
            const sorted = comm.member.map((x) => x.mem_id);
            let shuffled = sorted;
            while (check(sorted, shuffled))
            {
                shuffled=shuffle(sorted);
            }
            
            const giftIds = comm.member.map((x) => (x.gift[0].gift_id));
            console.log(giftIds);
            console.log(sorted);
            console.log(shuffled);
            const updateList = [];
            for (let i = 0; i< sorted.length; i++) {
                updateList.push({'gift_id':giftIds[i], 'gift_for':sorted[i], 'gift_by':shuffled[i]});
            }
            const { data, error } = await supabase
                .from('gift')
                .upsert(updateList);
            if (error) {
                console.log(error);
            }
            else {
                console.log(data);
                startEvent();
            }
        }
    }
    const shuffle = (members : number[]) => {
        const sortedArr = structuredClone(members);
        for (let i = sortedArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            console.log(sortedArr[i]);
            console.log(sortedArr[j]);
            [sortedArr[i], sortedArr[j]] = [sortedArr[j], sortedArr[i]];
        }
        return sortedArr;
    }
    const check = (arr1: number[], arr2:number[]) =>
    {
        for (let i = arr1.length - 1; i> 0 ; i--) {
            if (arr1[i] == arr2[i])
                return true;
        }
        return false;
    }

    const startEvent = async() => {
        const {data, error} = await supabase.from('community')
            .update({"comm_status":"DP"})
            .eq('comm_id', comm?.comm_id)
            .select();
        if (error)
        {
            console.log(error);
        }
        else if (comm)
        {
            console.log(data);
            setComm({...comm, comm_status:"DP"});
        }
    }

    const endEvent = async() => {
        const {data, error} = await supabase.from('community')
            .update({"comm_status":"FR"})
            .eq('comm_id', comm?.comm_id)
            .select();
        if (error)
        {
            console.log(error);
        }
        else if (comm)
        {
            console.log(data);
            setComm({...comm, comm_status:"FR"});
        }
    }
    
    const addMember = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {            
            console.log(Object.fromEntries(formData));
            const {data, error} = await supabase.from('member')
                .insert(Object.fromEntries(formData))
                .select(); 

            if (error)
                console.log(error)
            else {        
                if (data) {     
                    const newMem = data[0];    
                    newMem.gift = await getSingleGift(newMem.mem_id);
                    setMember((prev) => [...prev, newMem]);            
                    setMemActive(newMem);
                }
                goToMem(memToken);
                toast('Member added successfully');
                setCreateDialog(false);
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const getSingleGift = async (id: number) => {
        const {data, error} = await supabase.from('gift')
                        .select('*')
                        .eq("gift_for", id);
        if (data){
            return data;
        }
        else {
            console.log(error);
        }
    }
    const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);
        try {
            const {error} = await supabase.from('member')
                .update(Object.fromEntries(formData))
                .eq('mem_id', selectedMember?.member.mem_id);
            if (error)
                console.log(error)
            else {
                setMember((prev) => prev.map((x) => x.mem_id === selectedMember?.member.mem_id ?
                    {...x, ...Object.fromEntries(formData)}
                    : x));
                toast('Member edit successfully');
                setSelectedMember(null);
            }
        }
        catch (error) {
            console.log(error)
        }
    }
    const handleDeleteMember = async () =>  {
        try {
            console.log(selectedMember?.member);
            const {error} = await supabase.from('member')
                .delete()
                .eq('mem_id', selectedMember?.member.mem_id);
            if (error)
                console.log(error)
            else {
                setMember((prev) => prev.filter((mem) => mem.mem_id !== selectedMember?.member.mem_id));
                toast('Member deleted successfully');
                setSelectedMember(null);
            }
        }
        catch (error) {
            console.log(error)
        }
    }
    const verifyMemToken = async () => {
        const {data, error} = await supabase.from('member')
            .select('*')
            .eq("mem_token", memToken);
        
        if (error) {
            console.log("error: ", error);
        }
        else {
            if (data.length > 0 && comm != undefined)
            {
                console.log("data: ", data[0].mem_id);
                console.log("owner: ", comm.comm_owner)
                setMemActive(data[0]);
                if (data[0].mem_id == comm.comm_owner)
                {
                    setIsOwner(true);
                }
                goToMem(memToken);
            }
        }
    }
    const handleReveal = (e:React.MouseEvent<HTMLAnchorElement>, id: number) => {
        e.preventDefault();
        if (reveal && reveal.length > 0)
        {
            setReveal((prev) => prev.map((x) => x.mem_id === id ? {...x, value:true} : x));
        }
    }
    return (
        <div className="container mx-auto py-8 w-10/12">
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{comm?.comm_name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="mb-4 w-full flex justify-between">
                <div className="text-3xl font-bold">{comm?.comm_name}</div>                
                {
                    !memActive ?
                        <Button onClick={() => setMemberDialog(true)} className="font-bold" size="lg">I'm a member</Button>
                    :
                    (
                        <>
                        <h3 className="text-2xl font-bold">Hi, {memActive.mem_name}!</h3>
                        {isOwner && (
                        comm?.comm_status=="CR" ?
                        (<Dialog open={startDialog} onOpenChange={setStartDialog}>
                            <DialogTrigger asChild>
                                <Button className="font-bold">Start Secret Santa</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Start Secret Santa</DialogTitle>
                                    <DialogDescription>Exchange the reference secretly between members</DialogDescription>
                                </DialogHeader>
                                <p>Make sure all member have sent their reference.</p>
                                <p>Start Secret Santa now?</p>
                                <DialogFooter>
                                    <DialogClose>
                                        <Button type="button" variant="secondary" className="cursor-pointer">Cancel</Button>
                                        <Button type="button" onClick={handleStart} className="cursor-pointer">Start</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>):
                        (<Dialog open={startDialog} onOpenChange={setStartDialog}>
                            <DialogTrigger asChild>
                                <Button className="font-bold">Reveal Result</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Reveal Result</DialogTitle>
                                    <DialogDescription>Finish event and reveal gifts from each other</DialogDescription>
                                </DialogHeader>
                                <p>Make sure all member have sent their results.</p>
                                <p>Reveal Secret Santa now?</p>
                                <DialogFooter>
                                    <DialogClose>
                                        <Button type="button" variant="secondary" className="cursor-pointer">Cancel</Button>
                                        <Button type="button" onClick={endEvent} className="cursor-pointer">Start</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>)
                        ) }
                        </>
                    )
                }          
            </div>
            <h4 className="font-semibold text-2sl mb-2">Status: {comm?.status.status_name}({
                comm?.comm_status=="CR" ?
                  member.filter(x => x.gift[0].is_ref==true).length
                : member.filter(x => x.gift_created==true).length
            }/{member.length})</h4> 
            <p className="text-2sl mb-4">{comm?.comm_desc}</p>
            <div>
                <Table className="font">
                    <TableHeader>
                        <TableRow>
                            <TableHead  className="font-bold">Member Name</TableHead>
                            <TableHead  className="font-bold">Status</TableHead>
                            {
                                isOwner && (
                                    <TableHead>Manage</TableHead>
                                )
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            member?.map((x: IMember) => 
                            (<TableRow key={x.mem_id}>
                                <TableCell className="flex gap-3 items-center w-full">
                                    {x.mem_name}
                                </TableCell>
                                <TableCell>
                                    <p>{ comm?.comm_status != "CR" ? (x.gift_created ? "Result sent": "In progress") : 
                                    ((x.gift && (x.gift[0].is_ref)) ? "Reference sent" : "Pending reference")
                                    }</p>                                    
                                </TableCell>
                                {
                                    isOwner && (
                                    <TableCell>                                    
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="cursor-pointer">
                                                <Ellipsis/>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel>
                                                    Action
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem onClick={() => setSelectedMember({member:x, action:'edit'})}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSelectedMember({member:x, action:'delete'})} className="text-red-400">Delete</DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    )
                                }

                            </TableRow>))
                        }
                    </TableBody>
                </Table>
                <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                    { comm?.comm_status == 'CR' && !memActive && (<DialogTrigger asChild>
                        <Button className="font-bold" onClick={() => setMemToken(Math.random().toString(20).substring(2, 6).toUpperCase())}>I'm a new member!</Button>
                    </DialogTrigger>)}
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={addMember} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>Add Member</DialogTitle>
                                <DialogDescription>Join {comm?.comm_name} Community</DialogDescription>
                            </DialogHeader>
                            <div  className="grid w-full gap-4">
                                <div className="grid-w-full gap-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="mem_name" placeholder="Insert Name" required></Input>
                                </div>
                            </div>
                            <div  className="grid w-full gap-4">
                                <div className="grid-w-full gap-1.5">
                                    <Label>Community</Label>
                                    <Input id="comm" name="comm_id" value={comm?.comm_id} readOnly hidden></Input>
                                    <Input value={comm?.comm_name} disabled></Input>
                                </div>
                            </div>
                            <div  className="grid w-full gap-4">
                                <div className="grid-w-full gap-1.5">
                                    <Label htmlFor="mem_token">Token</Label>
                                    <div className="flex">
                                        <Input value={memToken} id="mem_token" name="mem_token" className="w-9/12" readOnly></Input>
                                        <Button className="w-3/12" type="button" onClick={() => {
                                            navigator.clipboard.writeText(memToken);
                                            toast("Token copied! Please save it to update your progress")}}>Copy</Button>
                                    </div>
                                    <DialogDescription>Copy your token to log in later</DialogDescription>
                                </div>                                
                           </div>                       
                            <DialogFooter>
                                <DialogClose>
                                    <Button type="button" variant="secondary" className="cursor-pointer">Cancel</Button>
                                    <Button type="submit" className="cursor-pointer">Register</Button>
                                </DialogClose>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            {
                comm?.comm_status == "FR" && 
                <div>
                    <h4 className="font-semibold text-2xl mb-4 mt-8">Result</h4>                
                    <div className="grid w-full gap-3-full lg:grid-cols-2 md:grid-cols-1">
                        {member.map(
                            (mem) => (
                                <>
                                    <Card key={mem.mem_id} id={`mem-${mem.mem_id}`} className="w-full">
                                    <CardHeader>
                                        <CardTitle>
                                            <h3 className="text-xl">{mem.mem_name} wishes</h3>
                                        </CardTitle>                                            
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <div>
                                                <p>{mem.gift[0].gift_desc}</p>
                                            </div>
                                        </div>
                                        <Image
                                            src={imgUrl+comm?.comm_id+"/ref/"+mem.mem_id}
                                            alt='no image'
                                            width={400}
                                            height={400}
                                            className="w-full object-cover rounded-lg mt-4"
                                        />
                                    </CardContent>
                                </Card> 
                                <Card key={mem.mem_id+"-res"} id={`mem-${mem.mem_id}`} className="w-full">
                                    <CardHeader>
                                        <CardTitle>
                                            <h3 className="text-xl mb-4">Dear {mem.mem_name}</h3>                                            
                                        </CardTitle>                                            
                                    </CardHeader>
                                    {
                                        reveal.filter((x) => x.mem_id == mem.mem_id)[0].value &&                                    
                                    <CardContent>
                                        <Image
                                            src={imgUrl+comm?.comm_id+"/res/"+mem.gift[0].gift_by}
                                            alt='no image'
                                            width={400}
                                            height={400}
                                            className="w-full object-cover rounded-lg"
                                        />
                                        <div className="mt-4">
                                            <div>
                                                <p>{mem.gift[0].gift_letter}</p>
                                                <h4 className="font-semibold text-xl">by {member.filter(((x) => x.mem_id == mem.gift[0].gift_by))[0].mem_name}</h4>                    
                                            </div>
                                        </div>
                                    </CardContent>
                                    }
                                    <CardFooter>
                                        {
                                            reveal.filter((x) => x.mem_id == mem.mem_id)[0].value ? 
                                            <a href={imgUrl+comm?.comm_id+"/res/"+mem.gift[0].gift_by} target="_blank" className="w-full" id={"download-"+mem.mem_id}>
                                                <Button className="w-full font-bold" size="lg">Download</Button>
                                            </a>
                                            :
                                            <a href='#' className="w-full" id={"reveal-"+mem.mem_id} onClick={(e) => handleReveal(e, mem.mem_id)}>
                                                <Button className="w-full font-bold" size="lg">Reveal Result</Button>
                                            </a>
                                        }
                                    </CardFooter>
                                </Card> 
                                
                                </>

                            )
                        )}
                        </div>
                </div>
            }                       
            <Dialog
                open={selectedMember !== null && selectedMember?.action === 'edit'}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedMember(null);
                    } 
                }}                   
            >
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleEdit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Edit Member</DialogTitle>
                            <DialogDescription>Make changes to member.</DialogDescription>
                        </DialogHeader>
                        <div  className="grid w-full gap-4">
                            <div className="grid-w-full gap-1.5"></div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="mem_name" placeholder="Insert Name" required defaultValue={selectedMember?.member.mem_name}></Input>
                        </div>
                        {/*<div  className="grid w-full gap-4">
                            <div className="grid-w-full gap-1.5"></div>
                            <Label htmlFor="comm">Community</Label>
                            <Input id="comm" name="comm_id" placeholder="Insert Community" required defaultValue={selectedMember?.member.comm_id}></Input>
                        </div>
                            <div  className="grid w-full gap-4">
                            <div className="grid-w-full gap-1.5"></div>
                            <Label htmlFor="mem_token">Category</Label>
                            <Select name="mem_token" defaultValue={'AD14'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Category"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        <SelectItem value="AD14">Twitter Artist</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div  className="grid w-full gap-4">
                            <div className="grid-w-full gap-1.5"></div>
                            <Label htmlFor="desc">Description</Label>
                            <Textarea id="desc" name="desc" placeholder="Insert Description" className="resize-none h-32" required></Textarea>
                        </div>
                        */}
                    
                        <DialogFooter>
                            <DialogClose>
                                <Button variant="secondary" type="button" className="cursor-pointer">Cancel</Button>
                                <Button type="submit" className="cursor-pointer">Edit Member</Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog
                open={selectedMember !== null && selectedMember?.action === 'delete'}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedMember(null);
                    } 
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Member</DialogTitle>
                        <DialogDescription>Are you sure want to delete?</DialogDescription>
                    </DialogHeader>                
                    <DialogFooter>
                        <DialogClose>
                            <Button variant="secondary" type="button" className="cursor-pointer">Cancel</Button>
                            <Button onClick={handleDeleteMember} variant="destructive" className="cursor-pointer">Delete</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={memberDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setMemberDialog(false);
                    } 
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Member Dashboard</DialogTitle>
                        <DialogDescription>Go to my dashboard</DialogDescription>
                    </DialogHeader> 
                    <div  className="grid w-full gap-4">
                        <div className="grid-w-full gap-1.5"></div>
                        <Label>Member token</Label>
                        <Input placeholder="Insert 4 digits token" value={memToken} onChange={e => setMemToken(e.currentTarget.value)} required></Input>
                    </div>               
                    <DialogFooter>
                        <DialogClose>
                            <Button variant="secondary" type="button" className="cursor-pointer">Cancel</Button>
                            <Button onClick={verifyMemToken} className="cursor-pointer">Enter</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
export default CommunityPage;