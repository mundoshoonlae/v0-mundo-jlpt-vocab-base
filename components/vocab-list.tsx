"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil, Trash2, Loader2, Search, X } from "lucide-react"
import type { Vocab } from "@/lib/types"
import { updateVocab, deleteVocab } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

interface VocabListProps {
  vocabList: Vocab[]
  onUpdate: () => void
}

export function VocabList({ vocabList, onUpdate }: VocabListProps) {
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  
  // Edit dialog state
  const [editingVocab, setEditingVocab] = useState<Vocab | null>(null)
  const [editWord, setEditWord] = useState("")
  
  // Delete dialog state
  const [deletingVocab, setDeletingVocab] = useState<Vocab | null>(null)

  const filteredList = vocabList.filter((vocab) => 
    vocab.word.includes(searchQuery)
  )

  const openEditDialog = (vocab: Vocab) => {
    setEditingVocab(vocab)
    setEditWord(vocab.word)
  }

  const closeEditDialog = () => {
    setEditingVocab(null)
    setEditWord("")
  }

  const handleUpdate = () => {
    if (!editingVocab || !editWord.trim()) return

    startTransition(async () => {
      const result = await updateVocab(editingVocab.id, { word: editWord })
      
      if (result.success) {
        toast({ title: "Updated", description: result.message })
        closeEditDialog()
        onUpdate()
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    })
  }

  const handleDelete = () => {
    if (!deletingVocab) return

    startTransition(async () => {
      const result = await deleteVocab(deletingVocab.id)
      
      if (result.success) {
        toast({ title: "Deleted", description: `Deleted "${deletingVocab.word}"` })
        setDeletingVocab(null)
        onUpdate()
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    })
  }

  return (
    <>
      <Card className="shadow-sm border-neutral-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl text-neutral-900">Vocabulary List</CardTitle>
              <CardDescription className="text-sm text-neutral-500">
                {filteredList.length} of {vocabList.length} words
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-neutral-100"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4 text-neutral-400" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          {/* Vocab List */}
          {vocabList.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <p className="text-lg font-medium">No vocabulary yet</p>
              <p className="text-sm mt-1">Add your first Japanese word to get started</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <p className="text-lg font-medium">No matches found</p>
              <p className="text-sm mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] sm:h-[500px] pr-2">
              <div className="space-y-2">
                {filteredList.map((vocab) => (
                  <div
                    key={vocab.id}
                    className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100"
                  >
                    <span className="text-xl sm:text-2xl font-medium text-neutral-900">
                      {vocab.word}
                    </span>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(vocab)}
                        className="h-9 w-9 p-0 hover:bg-neutral-200"
                      >
                        <Pencil className="w-4 h-4 text-neutral-600" />
                        <span className="sr-only">Edit {vocab.word}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingVocab(vocab)}
                        className="h-9 w-9 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span className="sr-only">Delete {vocab.word}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingVocab} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-neutral-900">Edit Word</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Make changes to this vocabulary entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-word" className="text-neutral-700">Word</Label>
              <Input
                id="edit-word"
                value={editWord}
                onChange={(e) => setEditWord(e.target.value)}
                className="text-xl h-14 border-neutral-200"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeEditDialog} className="border-neutral-200 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending} className="bg-neutral-900 hover:bg-neutral-800 text-white">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingVocab} onOpenChange={(open) => !open && setDeletingVocab(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900">Delete vocabulary?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500">
              Are you sure you want to delete &quot;{deletingVocab?.word}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-neutral-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
