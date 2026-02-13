
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Book } from "@/lib/types";

interface BookFormProps {
    formData: any;
    setFormData: (data: any) => void;
    errors: Record<string, string>;
    onSubmit: () => void;
    submitLabel: string;
}

export function BookForm({ formData, setFormData, errors, onSubmit, submitLabel }: BookFormProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: name === 'totalCopies' || name === 'copiesAvailable' ? Number(value) : value
        }));
    };

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={errors.title ? "border-destructive" : ""}
                    />
                    {errors.title && <span className="text-xs text-destructive">{errors.title}</span>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className={errors.author ? "border-destructive" : ""}
                    />
                    {errors.author && <span className="text-xs text-destructive">{errors.author}</span>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                        id="isbn"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                        className={errors.isbn ? "border-destructive" : ""}
                    />
                    {errors.isbn && <span className="text-xs text-destructive">{errors.isbn}</span>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="totalCopies">Total Copies</Label>
                    <Input
                        id="totalCopies"
                        name="totalCopies"
                        type="number"
                        min="1"
                        value={formData.totalCopies}
                        onChange={handleChange}
                    />
                </div>
                {/* For Edit only usually, but let's keep it simple for now or hide if create? 
            Usually available copies is auto-calc on create (equal to total), 
            but editable on update if adjustments needed manually? 
            Let's just show Total Copies for Create and both for Edit.
        */}
                <div className="grid gap-2">
                    <Label htmlFor="price">Base Price ($)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, price: parseFloat(e.target.value) }))}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="copiesAvailable">Copies Available</Label>
                    <Input
                        id="copiesAvailable"
                        name="copiesAvailable"
                        type="number"
                        min="0"
                        value={formData.copiesAvailable}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            <div className="flex justify-end mt-4">
                <Button onClick={onSubmit}>{submitLabel}</Button>
            </div>
        </div>
    );
}
