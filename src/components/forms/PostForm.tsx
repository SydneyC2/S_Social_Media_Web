import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from "@/components/ui/form"

import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import FileUploader from "../shared/FileUploader"
import { PostValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"
import { toast, useToast } from "../ui/use-toast"


type PostFormProps = {
  post?: Models.Document;
  action: '' | '';
}

const PostForm = ({ post, action } : PostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();
  
  
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

    // 1. Define the form
    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            caption: post ? post?.caption : "",
            file: [],
            location: post ? post?.location : "",
            tags: post ? post?.tags.join(',') : ''
        },
    })
    
    // Define a submit handler
    async function onSubmit(values: z.infer<typeof PostValidation>) {
      if(post && action === '') {
        const updatedPost = await updatePost({
          ...values,
          postId: post.$id,
          imageId: post?.imageId,
          imageUrl: post?.imageUrl,
        })

        if(!updatedPost) {
          toast({ title: 'Try again' })
          return navigate(`/update-post/${post.$id}`)
        }

        return navigate(`/posts/${post.$id}`)
      }

      const newPost = await createPost({
        ...values,
        userId: user.id,
      }) 
        
      if(!newPost) {
        toast({
          title: 'Try again'
        })
        return navigate(`/posts/create-post`)
      }

      return navigate('/');
    }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl">
        <FormField
         control={form.control}
         name="caption"
         render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form-label">Caption</FormLabel>
               <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" {...field} />
               </FormControl>
            <FormMessage />
            </FormItem>
         )}
        />
        <FormField
         control={form.control}
         name="file"
         render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form-label">Add Photos</FormLabel>
               <FormControl>
                <FileUploader 
                   fieldChange={field.onChange}
                   mediaUrl={post?.imageUrl}
                />
               </FormControl>
            <FormMessage />
            </FormItem>
         )}
        />
        <FormField
         control={form.control}
         name="location"
         render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form-label">Add Location</FormLabel>
               <FormControl>
                <Input type="text" className="shad-input" {...field} />
               </FormControl>
            <FormMessage />
            </FormItem>
         )}
        />
        <FormField
         control={form.control}
         name="tags"
         render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form-label">Add Tags (separated by comma " , ")</FormLabel>
               <FormControl>
                <Input type="text" 
                className="shad-input" 
                placeholder="Expression, Scenery, Enlightenment" {...field}
                />
               </FormControl>
            <FormMessage />
            </FormItem>
         )}
        />
        <div className="flex gap-4 items-center justify-end">
        <Button type="button" className="shad-button_dark_4">Cancel</Button>
        <Button type="submit" className="shad-button_primary whitespace-nowrap" disabled={isLoadingCreate || isLoadingUpdate}>
          {isLoadingCreate && 'Creating' || isLoadingUpdate && 'Updating'}
          {action} Post
        </Button>
        </div>
        </form>
    </Form>
  )
}

export default PostForm
