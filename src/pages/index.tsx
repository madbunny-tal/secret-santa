import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import supabase from "@/lib/db";
import type { IComm } from "@/types/comm";
import Image from 'next/image';
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter,  DialogDescription, DialogTitle, DialogClose  } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const Home = () => {
  const [comm, setComm] = useState<IComm[]>([]);
  const [token, setToken]=useState<{comm:string, owner:string}>({comm:"",owner:""});
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<IComm | null>(null);
  const router = useRouter();
  const goToComm = (path:string) => {
    router.push('/community/'+path);      
  }
  useEffect(() =>
  {
    const fetchComm = async () => {
      const {data, error} = await supabase.from('community').select("*, member(mem_id, mem_name), status(status_name)");
      
      if (error) {
        console.log("error: ", error);
      }
      else {
        console.log(data);
        setComm(data.map((x) => ({...x, comm_token:""})));
      }
    }
    fetchComm();
  }, [supabase]);
  
  const verifyCommToken = async () => {
    const {data, error} = await supabase.from('community')
      .select('*')
      .eq("comm_token", selectedCommunity?.comm_token)
      .eq("comm_id", selectedCommunity?.comm_id);
    
    if (error) {
      console.log("error: ", error);
    }
    else {
      const path = selectedCommunity?.comm_token;
      setSelectedCommunity(null);
      goToComm(path? path : "");
    }
  }
  const addCommunity = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {            
      console.log(Object.fromEntries(formData));

      //community insert
      var commData = Object.fromEntries(formData);
      delete (commData.mem_name);
      delete (commData.mem_token);
      commData.comm_status="CR";
      const {data, error} = await supabase.from('community')
        .insert(commData)
        .select('*, status(status_name)');
      console.log(data);
      if (error)
        console.log(error)
      else {
        if (data) {
          setComm((prev) => [...data, ...prev]);
        }
        var memData = Object.fromEntries(formData);
        delete (memData.comm_desc);
        delete (memData.comm_name);
        delete (memData.comm_token);
        console.log(memData);
        memData.comm_id = data[0].comm_id;
        await addMember(memData);
        toast('Community added successfully');
        setCreateDialog(false);
      }
    }
    catch (error) {
        console.log(error)
    }
  }

  const addMember = async(o:{[k:string]:FormDataEntryValue}) => {
    //insert owner
    const {data, error} = await supabase.from('member')
      .insert(o)
      .select('mem_id');
    if (error)
      console.log(error)
    else {
      console.log(data);
      await supabase.from('community')
      .update({"comm_owner":data[0].mem_id})
      .eq("comm_id", o.comm_id);
    }
  }
  return (
    <div className="container mx-auto py-8 w-10/12">
      <h1 className="text-4xl font-bold mb-4">Secret Santa</h1>
      <div className="flex w-full gap-6 mb-4">
        <Tabs defaultValue="what" className="w-full mb-4">
          <TabsList>
            <TabsTrigger value="what">What is it?</TabsTrigger>
            <TabsTrigger value="how">How does it work?</TabsTrigger>
            <TabsTrigger value="join">Who can join?</TabsTrigger>
            <TabsTrigger value="made">Who made this?</TabsTrigger>
          </TabsList>
          <TabsContent value="what">
            <Card>
              <CardContent>
                <p>Secret Santa is an event to gift each other anonymously.</p>
                <br/>
                <p>This website helps you hold Secret Santa event with art as gift.</p>
                <p>Members will have their desired character drawn and draw for other member.</p>
                <p>To whom or from who the art is will be secret until the event is finished!</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="how">
            <Card>
              <CardContent>
                <p>First, you need to gather member of your community</p>
                <ul className="list-disc pl-4 pt-2">
                  <li>Click "create community". Save both "community token" and "member (owner) token"</li>
                  <li>Share your "community token" to your friends who would like to join.</li>
                  <li>Your friend enter community page with the token and click "I'm a new member!".</li>
                  <li>Your friend copies their "member token" to update progress later</li>
                </ul>
                <br/>
                <p>Then, everyone upload reference image and description of the character they want</p>
                <ul className="list-disc pl-4 pt-2">
                  <li>Each members go to community page with the shared "community token"</li>
                  <li>Member goes to their own dashboard by clicking "I'm a member" and enter their "member token"</li>
                  <li>Member submits their reference and description</li>
                  <li>Reference submission progress can be seen through community dashboard</li>
                </ul>
                <br/>
                <p>Once all submissions are complete, start the event!</p>
                <ul className="list-disc pl-4 pt-2">
                  <li>Owner goes to community page</li>
                  <li>Owner clicks "I'm a member" and enter their "member (owner) token"</li>
                  <li>Owner's dashboard will be open in new tab, while community page will have "Start secret santa" button</li>
                  <li>Click the button to exchange references among members</li>
                </ul>
                <br/>
                <p>Wait everyone to complete their gift</p>
                <ul className="list-disc pl-4 pt-2">
                  <li>Members go to community page with the shared "community token"</li>
                  <li>Member goes to their own dashboard by clicking "I'm a member" and enter their "member token"</li>
                  <li>Member download reference and start drawing</li>
                  <li>Once done, member upload the result at their own dashboard.</li>
                </ul>
                <br/>
                <p>After all gifts submitted, owner reveals the results</p>
                <ul className="list-disc pl-4 pt-2">
                  <li>Owner goes to community page and their personal dashboard</li>
                  <li>Owner's dashboard will be open in new tab, while community page will have "Reveal result" button</li>
                  <li>Click the button and all the gifts will be displayed</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="join">
            <Card>
              <CardContent>
                Anyone can join! Ask your community to join the event
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="made">
            <Card>
              <CardContent>
                <p className="mb-4"><Link className="font-bold" href="https://madbunnymerch.netlify.app/about" target="_blank">Tal</Link> did! If anything, you can ask her. She's the admin.</p>
                <Link href="https://madbunnytal.carrd.co/" target="_blank"><u><i>Tal's carrd</i></u></Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <h2 className="text-3xl font-bold mb-4">Join Community</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
        {
          comm.map((x:IComm) => (
            <Card key={x.comm_id} className="w-full">
              <CardContent>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h4 className="font-semibold text-xl">{x.comm_name}</h4>
                    <h4 className="font-semibold text-2sl">Status: {x.status.status_name}</h4>                    
                    <p>{x.comm_desc}</p>
                  </div>
                  <p><span className="font-semibold text-xl">{x.member?.length}</span> member</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setSelectedCommunity(x)} className="w-full font-bold" size="lg">Open</Button>
              </CardFooter>
            </Card> 
          ))
        }
      </div>
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogTrigger asChild>
            <Button className="font-bold" onClick={() => setToken(
              {
                comm: Math.random().toString(20).substring(2, 6).toUpperCase(),
                owner: Math.random().toString(20).substring(2, 6).toUpperCase()
              }
            )}>Create new community</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <form onSubmit={addCommunity} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Add Community</DialogTitle>
                    <DialogDescription>Create Secret Santa event for your community</DialogDescription>
                </DialogHeader>
                <div  className="grid w-full gap-4">
                    <div className="grid-w-full gap-1.5">
                        <Label htmlFor="comm_name">Community Name</Label>
                        <Input id="comm_name" name="comm_name" placeholder="Insert community name" required></Input>
                    </div>
                </div>
                <div  className="grid w-full gap-4">
                  <div className="grid-w-full gap-1.5">
                    <Label htmlFor="comm_desc">Description</Label>
                    <Textarea id="comm_desc" name="comm_desc" placeholder="Insert Community Description" className="resize-none h-32" required></Textarea>
                  </div>
                </div>

                <div  className="grid w-full gap-4">
                    <div className="grid-w-full gap-1.5">
                        <Label htmlFor="comm_token">Community Token</Label>
                        <div className="flex">
                            <Input value={token.comm} id="comm_token" name="comm_token" className="w-9/12" readOnly></Input>
                            <Button className="w-3/12 " onClick={() => {
                                navigator.clipboard.writeText(token.comm);
                                toast("Token copied! Please save it to check community progresss")}}>Copy</Button>
                        </div>
                        <DialogDescription>Share this token within your community so they can register</DialogDescription>
                    </div>                                
                </div> 
                <div  className="grid w-full gap-4">
                    <div className="grid-w-full gap-1.5">
                        <Label htmlFor="mem_name">Owner Name</Label>
                        <Input id="mem_name" name="mem_name" placeholder="Insert your name" required></Input>
                    </div>
                </div>  
                <div  className="grid w-full gap-4">
                    <div className="grid-w-full gap-1.5">
                        <Label htmlFor="mem_token">Member Token (Owner)</Label>
                        <div className="flex">
                            <Input value={token.owner} id="mem_token" name="mem_token" className="w-9/12" readOnly></Input>
                            <Button className="w-3/12 " onClick={() => {
                                navigator.clipboard.writeText(token.owner);
                                toast("Token copied! Please save it to update your progress")}}>Copy</Button>
                        </div>
                        <DialogDescription>Keep this token for yourself to update your community and progress.</DialogDescription>
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
      {/*<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {
          comm.map((x:IComm) => (
            <Card key={x.comm_id}>
              <CardContent>
                <Image
                  src={'https://mqichvjbjuhwmbtpnklj.storage.supabase.co/v1/object/sign/images/public/20231130_094536.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZDFkM2YyZS1lNzcwLTQ0Y2MtOWFhMS1lY2ExMzY5YjNhYjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHVibGljLzIwMjMxMTMwXzA5NDUzNi5qcGciLCJpYXQiOjE3NTE5NTgxNjYsImV4cCI6MTc1NDU1MDE2Nn0.fDqAhI9qwho4nXVJgwgTUoF3hbD3VgNoCwVHWrNZitY'}
                  alt={x.comm_name}
                  width={200}
                  height={200}
                  className="w-full h-[30vh] object-cover rounded-lg"
                 />
                <div className="mt-4 flex justify-between">
                  <div>
                    <h4 className="font-semibold text-xl">{x.comm_name}</h4>
                    <p>public community</p>
                  </div>
                  <p className="font-semibold text-2xl">10</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/member/${x.comm_id}`} className="w-full" >
                  <Button className="w-full  font-bold" size="lg">Open</Button>
                </Link>
              </CardFooter>
            </Card> 
          ))
        }
      </div>*/}
      <Dialog
          open={selectedCommunity !== null}
          onOpenChange={(open) => {
              if (!open) {
                  setSelectedCommunity(null);
              } 
          }}
      >
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>{selectedCommunity?.comm_name}</DialogTitle>
                  <DialogDescription>Go to community page</DialogDescription>
              </DialogHeader> 
              <div  className="grid w-full gap-4">
                  <div className="grid-w-full gap-1.5"></div>
                  <Label>Community token</Label>
                  <Input placeholder="Insert 4 digits token" value={selectedCommunity?.comm_token} onChange={e => setSelectedCommunity(selectedCommunity ? {...selectedCommunity, comm_token:e.currentTarget.value} : selectedCommunity)} required></Input>
              </div>               
              <DialogFooter>
                  <DialogClose>
                      <Button variant="secondary" type="button" className="cursor-pointer">Cancel</Button>
                      <Button onClick={verifyCommToken} className="cursor-pointer">Enter</Button>
                  </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );

};

export default Home;