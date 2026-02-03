"use client"

import { useState, useTransition, useMemo } from "react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Loader2, Search, X } from "lucide-react"
import type { Vocab, JLPTLevel } from "@/lib/types"
import { updateVocab, deleteVocab, deleteAllVocab } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VocabListProps {
  vocabList: Vocab[]
  onUpdate: () => void
}

export function VocabList({ vocabList, onUpdate }: VocabListProps) {
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL")
  const { toast } = useToast()

  // Edit dialog state
  const [editingVocab, setEditingVocab] = useState<Vocab | null>(null)
  const [editWord, setEditWord] = useState("")
  const [editLevel, setEditLevel] = useState<JLPTLevel | undefined>(undefined)

  // Delete dialog state
  const [deletingVocab, setDeletingVocab] = useState<Vocab | null>(null)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  const filteredList = useMemo(() => {
    return vocabList.filter((vocab) => {
      const matchesSearch = vocab.word.includes(searchQuery)
      const matchesLevel = selectedLevel === "ALL" ||
        (selectedLevel === "Unclassified" ? !vocab.level : vocab.level === selectedLevel)
      return matchesSearch && matchesLevel
    })
  }, [vocabList, searchQuery, selectedLevel])

  const openEditDialog = (vocab: Vocab) => {
    setEditingVocab(vocab)
    setEditWord(vocab.word)
    setEditLevel(vocab.level)
  }

  const closeEditDialog = () => {
    setEditingVocab(null)
    setEditWord("")
    setEditLevel(undefined)
  }

  const handleUpdate = () => {
    if (!editingVocab || !editWord.trim()) return

    startTransition(async () => {
      const result = await updateVocab(editingVocab.id, { word: editWord, level: editLevel })

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

  const handleDeleteAll = () => {
    startTransition(async () => {
      const result = await deleteAllVocab()

      if (result.success) {
        toast({ title: "Deleted All", description: "All vocabulary has been deleted." })
        setIsDeletingAll(false)
        onUpdate()
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    })
  }

  const getLevelColor = (level?: JLPTLevel) => {
    switch (level) {
      case "N1": return "bg-red-100 text-red-700 border-red-200"
      case "N2": return "bg-orange-100 text-orange-700 border-orange-200"
      case "N3": return "bg-amber-100 text-amber-700 border-amber-200"
      case "N4": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "N5": return "bg-blue-100 text-blue-700 border-blue-200"
      default: return "bg-neutral-100 text-neutral-600 border-neutral-200"
    }
  }

  return (
    <>
      <Card className="shadow-sm border-neutral-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl text-neutral-900">Vocabulary List</CardTitle>
              <CardDescription className="text-sm text-neutral-500">
                {filteredList.length} words
              </CardDescription>
            </div>
            {vocabList.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeletingAll(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            )}
          </div>

          <div className="mt-4">
            <Tabs defaultValue="ALL" onValueChange={setSelectedLevel} className="w-full">
              <TabsList className="grid grid-cols-7 w-full h-auto p-1 bg-neutral-100/50">
                {["ALL", "N5", "N4", "N3", "N2", "N1", "Unclassified"].map((level) => (
                  <TabsTrigger
                    key={level}
                    value={level}
                    className="text-xs sm:text-sm px-1 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {level === "Unclassified" ? "?" : level}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
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
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] sm:h-[500px] pr-2">
              <div className="space-y-2">
                {filteredList.map((vocab) => (
                  <div
                    key={vocab.id}
                    className="group flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`${getLevelColor(vocab.level)} border bg-opacity-50`}>
                        {vocab.level || "?"}
                      </Badge>
                      <span className="text-lg sm:text-xl font-medium text-neutral-900">
                        {vocab.word}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(vocab)}
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-neutral-200"
                      >
                        <Pencil className="w-4 h-4 text-neutral-600" />
                        <span className="sr-only">Edit {vocab.word}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingVocab(vocab)}
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-red-50"
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
            <div className="space-y-2">
              <Label className="text-neutral-700">Level</Label>
              <Select value={editLevel || "no-level"} onValueChange={(val) => setEditLevel(val === "no-level" ? undefined : val as JLPTLevel)}>
                <SelectTrigger className="w-full border-neutral-200">
                  <SelectValue placeholder="JLPT Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-level">No Level</SelectItem>
                  <SelectItem value="N5">N5 (Easy)</SelectItem>
                  <SelectItem value="N4">N4</SelectItem>
                  <SelectItem value="N3">N3</SelectItem>
                  <SelectItem value="N2">N2</SelectItem>
                  <SelectItem value="N1">N1 (Hard)</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Delete All Confirmation */}
      <AlertDialog open={isDeletingAll} onOpenChange={setIsDeletingAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete All Vocabulary?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500">
              This will permanently delete ALL vocabulary words from the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-neutral-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
