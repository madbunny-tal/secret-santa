import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import supabase from "@/lib/db";
import type { IMember } from "@/types/member";
import { FormEvent, useEffect, useState } from "react";
import Image from 'next/image';
import { Ellipsis } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter,  DialogDescription, DialogTitle, DialogClose  } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CommunityPage =  () => {
    const [member, setMember] = useState<IMember[]>([]);      
    const [createDialog, setCreateDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState<{
        member: IMember;
        action: 'edit' | 'delete';
    } | null>(null);

    useEffect(() =>
    {
    const fetchComm = async () => {
        const {data, error} = await supabase.from('member').select('*');
        
        if (error) {
        console.log("error: ", error);
        }
        else {
        setMember(data);
        }
    }
    fetchComm();
    }, [supabase]);

    const handleStart = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            const {data, error} = await supabase.from('member')
                .insert(Object.fromEntries(formData))
                .select();
            if (error)
                console.log(error)
            else {
                if (data) {
                    setMember((prev) => [...data, ...prev]);
                }
                toast('Member added successfully');
                setCreateDialog(false);
            }
        }
        catch (error) {
            console.log(error)
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
            const {data, error} = await supabase.from('member')
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
    return (
        <div className="container mx-auto py-8">
            <div className="mb-4 w-full flex justify-between">
                <div className="text-3xl font-bold">Community Admin</div>
                <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="font-bold">Start Secret Santa</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleStart} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>Add Member</DialogTitle>
                                <DialogDescription>Lorem ipsum dolor sit amet</DialogDescription>
                            </DialogHeader>
                            <div  className="grid w-full gap-4">
                                <div className="grid-w-full gap-1.5"></div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="mem_name" placeholder="Insert Name" required></Input>
                            </div>
                            <div  className="grid w-full gap-4">
                                <div className="grid-w-full gap-1.5"></div>
                                <Label htmlFor="comm">Community</Label>
                                <Input id="comm" name="mem_comm" placeholder="Insert Community" required></Input>
                            </div>
                                <div  className="grid w-full gap-4">
                                <div className="grid-w-full gap-1.5"></div>
                                <Label htmlFor="mem_token">Category</Label>
                                <Select name="mem_token">
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
                            {/*
                            <div  className="grid w-full gap-4">
                                <div className="grid-w-full gap-1.5"></div>
                                <Label htmlFor="desc">Description</Label>
                                <Textarea id="desc" name="desc" placeholder="Insert Description" className="resize-none h-32" required></Textarea>
                            </div>
                            */}
                        
                            <DialogFooter>
                                <DialogClose>
                                    <Button type="button" variant="secondary" className="cursor-pointer">Cancel</Button>
                                    <Button type="submit" className="cursor-pointer">Create</Button>
                                </DialogClose>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            member.map((x: IMember) => 
                            (<TableRow key={x.mem_id}>
                                <TableCell className="flex gap-3 items-center w-full">
                                    <Image
                                        src={'https://mqichvjbjuhwmbtpnklj.storage.supabase.co/v1/object/sign/images/public/20231130_094536.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZDFkM2YyZS1lNzcwLTQ0Y2MtOWFhMS1lY2ExMzY5YjNhYjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHVibGljLzIwMjMxMTMwXzA5NDUzNi5qcGciLCJpYXQiOjE3NTE5NTgxNjYsImV4cCI6MTc1NDU1MDE2Nn0.fDqAhI9qwho4nXVJgwgTUoF3hbD3VgNoCwVHWrNZitY'}
                                        alt={x.mem_name}
                                        width={50}
                                        height={50}
                                        className="aspect-square object-cover rounded-lg"
                                    />
                                    {x.mem_name}
                                </TableCell>
                                <TableCell>
                                    {"lorem ipsum dolor sit amet constecteur adispicing velit".split(' ').slice(0,5).join(' ') + "..."}
                                </TableCell>
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
                            </TableRow>))
                        }
                    </TableBody>
                </Table>
            </div>
            <Dialog
                open={selectedMember !== null && selectedMember?.action === 'edit'}                
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
                        <div  className="grid w-full gap-4">
                            <div className="grid-w-full gap-1.5"></div>
                            <Label htmlFor="comm">Community</Label>
                            <Input id="comm" name="mem_comm" placeholder="Insert Community" required defaultValue={selectedMember?.member.mem_comm}></Input>
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
                        {/*
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
        </div>
    )
}
export default CommunityPage;