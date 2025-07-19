import supabase from "@/lib/db";
import { IMember } from "@/types/member";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage,BreadcrumbSeparator} from "@/components/ui/breadcrumb"

const imgUrl = 'https://mqichvjbjuhwmbtpnklj.supabase.co/storage/v1/object/public/images/';

const Member = () => {
    const router = useRouter();
    const [mem, setMem] = useState<IMember|null>(null);
    const [refUrl, setRefUrl] = useState('');
    const [fields, setFields] = useState({
        ref_image: false,
        res_image: false,
      }
    ); //for invoice data received from form
    useEffect(() => {
        const fetchMember = async () => {
            if (router.query.id) {
                const {data, error} = await supabase
                    .rpc('memberdetail',{token: router.query.id });
                console.log(data);
                if (error)
                    console.log(error)
                else {
                    setMem(data[0]);
                    setFields(
                        {
                            ref_image : data[0].gift_reference,
                            res_image : data[0].gift_created
                        }
                    )
                }
            }
        };
        fetchMember();
    }, [router.query.id]);

    useEffect(() => {
        if (mem?.comm_status != "CR")
        {
            getRefImage();
        }
    }, [mem])
    //upload reference image
    async function uploadImage(e:HTMLInputElement, isRef:boolean) {
        if (e.files != null && e.files.length > 0)
        {
            let file = e.files[0];
            
            const {data, error} = await supabase
                .storage
                .from('images')
                .update(mem?.comm_id + (isRef ? "/ref/" : "/res/") +  mem?.mem_id, file,
                    {
                        cacheControl: '3600',
                        upsert: true
                    });

            if (data)
            {
                toast("Upload Success");
                if (isRef)
                {
                    setFields((fields) => {return {...fields, ref_image:true}});
                }
                else{
                    setFields((fields) => {return {...fields, res_image:true}});
                }
            }
            else
            {
                console.log(error);
            }
        }
    }

    const getRefImage = async() => {
        const {data} = await supabase
            .storage
            .from('images')
            .getPublicUrl(mem?.comm_id+"/ref/" +mem?.gift_for);

        if (data)
        {
            setRefUrl(data.publicUrl);
        }
        else
        {
            console.log("Error loading image");
        }
    }

    const updateMem = (prop:string, val:string) => {
        if (!mem)
            return;
        switch (prop)
        {
            case 'gift_desc':
                setMem({...mem, gift_desc:val});
                break;
            case 'gift_letter':
                setMem({...mem, gift_letter:val});
                break;
        }
    }

    const updateImage = async (e: FormEvent<HTMLFormElement>, isRef: boolean) => {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);
        try {
            const {error} = await supabase.from('gift')
                .update(Object.fromEntries(formData))
                .eq(isRef ? 'gift_for' : 'gift_by', mem?.mem_id);
            if (error)
                console.log(error)
            else {
                console.log(Object.fromEntries(formData));  
                toast((isRef ? 'Reference' : 'Result') + 'updated successfully');
            }
        }
        catch (error) {
            console.log(error)
        }
    }
    
    return (
        <div className="container mx-auto py-8 w-11/12">
             <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="#">{mem?.comm_name}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{mem?.mem_name}'s Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="flex gap-16">
                {
                    mem &&
                    <div className="grid items-center w-full">
                        <div className="flex">
                            <div className="center lg:w-4/12 sm:w-full text-3xl font-bold text-background bg-foreground p-2">
                                <h1 className="text-center">{mem.comm_name}</h1>
                            </div>                        
                            <div className="text-right lg:w-8/12 sm:w-full text-3xl font-bold p-2">{mem.mem_name}'s Dashboard</div>
                        </div>
                        <p className="text-2xl m-4">status: <strong>{mem.comm_status=="CR" ? "Collecting Reference" : "Drawing in progress"}</strong></p>
                        <div className="lg:flex w-full items-center gap-3">
                        {
                            mem.comm_status == "CR" ? (
                            <Card className="lg:w-1/2 sm:w-full">
                                <CardHeader>
                                    <CardTitle className="mb-4 w-full flex justify-between">
                                        <h2 className="text-2xl mb-4 w-full flex justify-between">Reference Upload</h2>
                                        {
                                            (mem.gift_reference || fields.ref_image) ? (
                                                <p>Reference submitted</p>
                                            ) : (<></>)
                                        }                                    
                                    </CardTitle>
                                    
                                    <CardDescription>
                                        Upload character reference of gift you want and write description if necessary.
                                    </CardDescription>                                  
                                </CardHeader>
                                <form onSubmit={e => updateImage(e,true)}>
                                <CardContent>
                                    
                                    <div className="flex flex-col gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="ref" >Upload reference</Label>
                                            <Input id="ref" type="file" accept="image/png, image/jpeg" onChange={e => uploadImage(e.target, true)}/>
                                            <Input id="is_ref" name="is_ref" value={fields.ref_image ? 1 : 0} hidden></Input>
                                            {
                                                (mem.gift_reference || fields.ref_image) ? (
                                                    <Image src={imgUrl+mem.comm_id + '/ref/'+mem.mem_id} height={1080} width={1080} alt='no image'/>
                                                ):<></>
                                            }
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="gift_desc">Description</Label>
                                            <Textarea id="gift_desc" name="gift_desc" placeholder="Describe your desired character" value={mem.gift_desc} onChange={(e) => updateMem('gift_desc', e.target.value)}/>
                                        </div>
                                    </div>                                    
                                </CardContent>
                                <CardFooter className="flex-col gap-2">
                                    <Button type="submit" className="w-full">
                                        Submit Reference
                                    </Button>
                                </CardFooter>
                                </form>
                                </Card>
                            ) : (
                            <>
                            <Card className="w-full max-w-sm">
                                <CardHeader>
                                    <CardTitle>Reference Download</CardTitle>
                                    <CardDescription>
                                        Download your reference and draw according to description if any.
                                    </CardDescription>                                  
                                </CardHeader>
                                <CardContent>

                                    <Image
                                        src={refUrl}
                                        alt={mem.mem_name}
                                        className="w-full object-cover rounded-2xl mb-4"
                                        width={1080}
                                        height={1080}
                                    />
                                    <Textarea id="gift_desc" name="gift_desc" placeholder="Describe your desired character" value={mem.gift_desc} readOnly/>                                        
                                    <div className="grid gap-2">
                                        <a href={refUrl} target="_blank"><Button className="w-full">Download Reference</Button></a>
                                    </div>
                                </CardContent>                                   
                            </Card>
                            <Card className="w-full max-w-sm">
                                <CardHeader>
                                    <CardTitle className="mb-4 w-full flex justify-between">
                                        <h2 className="text-2xl mb-4 w-full flex justify-between">Result Upload</h2>
                                            {
                                                (mem.gift_created || fields.res_image) ? (
                                                    <p>Result submitted</p>
                                                ) :  (<></>)
                                            }      
                                    </CardTitle>
                                    <CardDescription>
                                        Upload gift result and maybe write some letter for the recipient.
                                    </CardDescription>                                  
                                </CardHeader>
                                <form onSubmit={e => updateImage(e,false)}>
                                    <CardContent>
                                        
                                        <div className="flex flex-col gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="res" >Upload result</Label>
                                                <Input id="res" type="file" accept="image/png, image/jpeg" onChange={e => uploadImage(e.target, false)}/>
                                                <Input id="is_res" name="is_res" value={fields.res_image ? 1 : 0} hidden></Input>
                                                {
                                                    (mem.gift_created || fields.res_image) ? (
                                                        <Image src={imgUrl+mem.comm_id + '/res/'+mem.mem_id} height={1080} width={1080} alt='no image'/>
                                                    ):<></>
                                                }
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="gift_letter">Gift letter</Label>
                                                <Textarea id="gift_letter" name="gift_letter" placeholder="Write something for the gift receiver" value={mem.gift_letter} onChange={(e) => updateMem('gift_letter', e.target.value)}/>
                                            </div>
                                        </div>
                                    
                                    </CardContent>
                                    <CardFooter className="flex-col gap-2">
                                        <Button type="submit" className="w-full">
                                            Submit Result
                                        </Button>
                                    </CardFooter>
                                     </form>
                                </Card>
                            </>
                        )}
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}
export default Member;