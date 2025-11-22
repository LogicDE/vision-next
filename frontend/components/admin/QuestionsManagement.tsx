'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Loader2,
  Trash2,
  Edit,
} from 'lucide-react';
import { fetchAPI } from '@/lib/apiClient';
import { toast } from 'sonner';

interface QuestionI18n {
  locale: string;
  text: string;
}

interface Question {
  id: number;
  i18nTexts?: QuestionI18n[];
  createdAt?: string;
}

export function QuestionsManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editQuestionText, setEditQuestionText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAPI('/questions');
      setQuestions(res || []);
    } catch (error: any) {
      toast.error(`Error al cargar preguntas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getQuestionText = (question: Question): string => {
    const esText = question.i18nTexts?.find((i18n) => i18n.locale === 'es');
    return esText?.text || 'Sin texto';
  };

  const handleCreateQuestion = async () => {
    if (!newQuestionText.trim()) {
      toast.error('El texto de la pregunta es requerido');
      return;
    }

    try {
      // Create question
      const questionRes = await fetchAPI('/questions', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Create i18n text for Spanish
      await fetchAPI('/question-i18n', {
        method: 'POST',
        body: JSON.stringify({
          questionId: questionRes.id,
          locale: 'es',
          text: newQuestionText.trim(),
        }),
      });

      toast.success('Pregunta creada exitosamente');
      setIsCreateDialogOpen(false);
      setNewQuestionText('');
      loadData();
    } catch (error: any) {
      toast.error(`Error al crear pregunta: ${error.message}`);
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion || !editQuestionText.trim()) {
      toast.error('El texto de la pregunta es requerido');
      return;
    }

    try {
      const esI18n = editingQuestion.i18nTexts?.find((i18n) => i18n.locale === 'es');
      
      if (esI18n) {
        // Update existing i18n
        await fetchAPI(`/question-i18n/${editingQuestion.id}/es`, {
          method: 'PUT',
          body: JSON.stringify({
            text: editQuestionText.trim(),
          }),
        });
      } else {
        // Create new i18n
        await fetchAPI('/question-i18n', {
          method: 'POST',
          body: JSON.stringify({
            questionId: editingQuestion.id,
            locale: 'es',
            text: editQuestionText.trim(),
          }),
        });
      }

      toast.success('Pregunta actualizada exitosamente');
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      setEditQuestionText('');
      loadData();
    } catch (error: any) {
      toast.error(`Error al actualizar pregunta: ${error.message}`);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      return;
    }

    try {
      await fetchAPI(`/questions/${questionId}`, {
        method: 'DELETE',
      });
      toast.success('Pregunta eliminada exitosamente');
      loadData();
    } catch (error: any) {
      toast.error(`Error al eliminar pregunta: ${error.message}`);
    }
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setEditQuestionText(getQuestionText(question));
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-gray-400">Cargando preguntas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Preguntas</h3>
          <p className="text-sm text-gray-400 mt-1">
            Gestiona todas las preguntas disponibles para las encuestas
          </p>
        </div>
        <Button
          onClick={() => {
            setNewQuestionText('');
            setIsCreateDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Pregunta
        </Button>
      </div>

      {/* Questions List */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Todas las Preguntas</CardTitle>
          <CardDescription className="text-gray-400">
            {questions.length} pregunta(s) disponible(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay preguntas creadas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{getQuestionText(question)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-white/10 text-gray-400">
                          ID: {question.id}
                        </Badge>
                        {question.createdAt && (
                          <span className="text-xs text-gray-500">
                            Creada el {new Date(question.createdAt).toLocaleDateString('es-MX')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(question)}
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Question Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Crear Nueva Pregunta</DialogTitle>
            <DialogDescription className="text-gray-400">
              Ingresa el texto de la pregunta en español
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="questionText" className="text-white">
                Texto de la Pregunta
              </Label>
              <Input
                id="questionText"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Ej: ¿Cómo te sientes hoy?"
                className="bg-slate-800 border-white/10 text-white mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateQuestion}
              disabled={!newQuestionText.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Crear Pregunta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Pregunta</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifica el texto de la pregunta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editQuestionText" className="text-white">
                Texto de la Pregunta
              </Label>
              <Input
                id="editQuestionText"
                value={editQuestionText}
                onChange={(e) => setEditQuestionText(e.target.value)}
                placeholder="Ej: ¿Cómo te sientes hoy?"
                className="bg-slate-800 border-white/10 text-white mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingQuestion(null);
                setEditQuestionText('');
              }}
              className="border-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditQuestion}
              disabled={!editQuestionText.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

