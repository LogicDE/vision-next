'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Plus,
  Loader2,
  CheckCircle,
  Layers,
  Star,
} from 'lucide-react';
import { fetchAPI } from '@/lib/apiClient';
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
}

interface SurveyVersion {
  id: number;
  versionNum: number;
  active: boolean;
  createdAt: string;
  questionCount: number;
  questions: Question[];
}

export function SurveyVersionsManagement() {
  const [versions, setVersions] = useState<SurveyVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<SurveyVersion | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSetCurrentDialogOpen, setIsSetCurrentDialogOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [newVersionNum, setNewVersionNum] = useState<number>(1);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [versionsRes, currentRes, questionsRes] = await Promise.all([
        fetchAPI('/survey-versions').catch(() => []),
        fetchAPI('/survey-versions/current').catch(() => null),
        fetchAPI('/questions').catch(() => []),
      ]);
      setVersions(Array.isArray(versionsRes) ? versionsRes : []);
      setCurrentVersion(currentRes || null);
      
      // Extract questions from i18n texts
      const questions = (Array.isArray(questionsRes) ? questionsRes : []).map((q: any) => ({
        id: q.id,
        text: q.i18nTexts?.find((i18n: any) => i18n.locale === 'es')?.text || 'Sin texto',
      }));
      setAllQuestions(questions);
    } catch (error: any) {
      toast.error(`Error al cargar datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVersion = async () => {
    if (selectedQuestionIds.length === 0) {
      toast.error('Selecciona al menos una pregunta');
      return;
    }

    try {
      await fetchAPI('/survey-versions', {
        method: 'POST',
        body: JSON.stringify({
          versionNum: newVersionNum,
          questionIds: selectedQuestionIds,
        }),
      });
      toast.success('Versión creada exitosamente');
      setIsCreateDialogOpen(false);
      setNewVersionNum(versions.length > 0 ? Math.max(...versions.map(v => v.versionNum)) + 1 : 1);
      setSelectedQuestionIds([]);
      loadData();
    } catch (error: any) {
      toast.error(`Error al crear versión: ${error.message}`);
    }
  };

  const handleSetCurrent = async () => {
    if (!selectedVersionId) {
      toast.error('No se seleccionó una versión');
      return;
    }
    try {
      await fetchAPI(`/survey-versions/current/${selectedVersionId}`, {
        method: 'PUT',
      });
      toast.success('Versión actual actualizada');
      setIsSetCurrentDialogOpen(false);
      setSelectedVersionId(null);
      loadData();
    } catch (error: any) {
      toast.error(`Error al actualizar versión actual: ${error.message}`);
    }
  };

  const toggleQuestion = (questionId: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-gray-400">Cargando versiones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Versiones de Encuestas</h3>
          <p className="text-sm text-gray-400 mt-1">
            Gestiona las versiones de encuestas y establece la versión actual
          </p>
        </div>
        <Button
          onClick={() => {
            setNewVersionNum(versions.length > 0 ? Math.max(...versions.map(v => v.versionNum)) + 1 : 1);
            setSelectedQuestionIds([]);
            setIsCreateDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Versión
        </Button>
      </div>

      {/* Current Version Info */}
      {currentVersion && (
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-yellow-400" />
              Versión Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">
                  Versión {currentVersion.versionNum}
                </p>
                <p className="text-sm text-gray-400">
                  {currentVersion.questionCount} pregunta(s) • Creada el {new Date(currentVersion.createdAt).toLocaleDateString('es-MX')}
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Activa
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Versions List */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Todas las Versiones</CardTitle>
          <CardDescription className="text-gray-400">
            {versions.length} versión(es) disponible(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay versiones creadas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 font-semibold">
                      v{version.versionNum}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">
                          Versión {version.versionNum}
                        </p>
                        {version.active && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Actual
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {version.questionCount} pregunta(s) • {new Date(version.createdAt).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!version.active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVersionId(version.id);
                          setIsSetCurrentDialogOpen(true);
                        }}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      >
                        Establecer como Actual
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Version Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Crear Nueva Versión</DialogTitle>
            <DialogDescription className="text-gray-400">
              Selecciona las preguntas para esta nueva versión de encuesta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="versionNum" className="text-white">
                Número de Versión
              </Label>
              <Input
                id="versionNum"
                type="number"
                value={newVersionNum}
                onChange={(e) => setNewVersionNum(parseInt(e.target.value) || 1)}
                min={1}
                className="bg-slate-800 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Preguntas ({selectedQuestionIds.length} seleccionadas)</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto border border-white/10 rounded-lg p-4 bg-slate-800/50">
                {allQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedQuestionIds.includes(question.id)}
                      onCheckedChange={() => toggleQuestion(question.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-400">
                          {index + 1}.
                        </span>
                        <p className="text-sm text-white">{question.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              onClick={handleCreateVersion}
              disabled={selectedQuestionIds.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Crear Versión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Current Version Dialog */}
      <Dialog open={isSetCurrentDialogOpen} onOpenChange={setIsSetCurrentDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Establecer Versión Actual</DialogTitle>
            <DialogDescription className="text-gray-400">
              ¿Estás seguro de que deseas establecer esta versión como la actual?
              Todas las nuevas encuestas usarán esta versión.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSetCurrentDialogOpen(false)}
              className="border-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSetCurrent}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

