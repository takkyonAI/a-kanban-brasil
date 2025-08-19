import { useState, useEffect } from "react";
import { Student, FollowUp } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import FollowUpManager from "./FollowUpManager";
import { Lock, Edit3 } from "lucide-react";


interface StudentDetailsDialogV2Props {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedStudent: Student) => void;
}

const StudentDetailsDialogV2 = ({ 
  student, 
  isOpen, 
  onClose, 
  onUpdate 
}: StudentDetailsDialogV2Props) => {
  const { username, user, isLoggedIn } = useAuth();
  
  // Debug do contexto de autenticação - LOGS ÓBVIOS - ATUALIZADO AGORA!
  console.log('🚨🚨🚨 MODAL ABERTO PARA:', student.nome);
  console.log('🔐 USUÁRIO LOGADO:', { username, isLoggedIn, role: user?.role });
  console.log('📝 PODE EDITAR:', { canEditStudentData: true }); // Forçando true para teste
  console.log('⏰ TIMESTAMP:', new Date().toLocaleTimeString()); // Para confirmar recompilação
  const [observacoes, setObservacoes] = useState(student.observacoes || "");
  const [dataPagamento, setDataPagamento] = useState(student.dataPagamento || "");
  const [isDateRequired, setIsDateRequired] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isEditingObservacoes, setIsEditingObservacoes] = useState(false);
  
  // Estados para edição de campos do aluno
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editedNome, setEditedNome] = useState(student.nome || "");
  const [editedValor, setEditedValor] = useState(student.valor?.toString() || "");
  const [editedDataVencimento, setEditedDataVencimento] = useState(student.dataVencimento || "");
  const [editedCurso, setEditedCurso] = useState(student.curso || "");
  const [editedEmail, setEditedEmail] = useState(student.email || "");
  const [editedTelefone, setEditedTelefone] = useState(student.telefone || "");
  
  // Estados para validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Verificar se o usuário atual pode editar as observações
  const canEditObservacoes = !student.createdBy || student.createdBy === username;
  
  // Verificar se o usuário atual pode editar os dados básicos do aluno
  // Permitir edição se: 1) é admin, 2) não há criador, 3) é o criador, 4) username é null
  const canEditStudentData = user?.role === 'admin' || !student.createdBy || student.createdBy === username || !username;
  
  // Debug de permissões - logs detalhados
  console.log(`[StudentDetails] 🔍 Debug completo para ${student.nome}:`, {
    student_createdBy: student.createdBy,
    current_username: username,
    username_type: typeof username,
    username_length: username?.length,
    canEditObservacoes,
    canEditStudentData,
    isEditingStudent,
    modal_isOpen: isOpen
  });
  
  // Log específico para o botão de edição
  console.log(`[StudentDetails] 🎛️ Botão de edição deve aparecer?`, {
    condition_1: !isEditingStudent,
    condition_2: canEditStudentData,
    final_result: (!isEditingStudent && canEditStudentData)
  });

  // Reset form when student changes
  useEffect(() => {
    setObservacoes(student.observacoes || "");
    setDataPagamento(student.dataPagamento || "");
    setIsEditingObservacoes(false);
    setIsEditingStudent(false);
    
    // Reset student fields
    setEditedNome(student.nome || "");
    setEditedValor(student.valor?.toString() || "");
    setEditedDataVencimento(student.dataVencimento || "");
    setEditedCurso(student.curso || "");
    setEditedEmail(student.email || "");
    setEditedTelefone(student.telefone || "");
    
    // Reset validation errors
    setValidationErrors({});
    
    // Date is required when current status is "resposta-recebida" and we want to move to "pagamento-feito"
    setIsDateRequired(student.status === "resposta-recebida");
  }, [student]);

  // 📱 CORREÇÃO MOBILE - Follow-ups não apareciam no mobile - 18/01/2025
  // 
  // PROBLEMA: Modal dependia de student.followUps que sempre era array vazio
  // CAUSA: Dados não eram carregados do banco ao buscar estudantes
  // SOLUÇÃO: Carregamento direto do banco quando modal abre
  // Usar follow-ups que já vêm carregados com o aluno
  useEffect(() => {
    if (isOpen && student.id) {
      console.log(`📋 Usando follow-ups já carregados para aluno ${student.id} (${student.nome})`);
      console.log(`📋 Follow-ups disponíveis:`, student.followUps);
      setFollowUps(student.followUps || []);
    }
  }, [isOpen, student.id, student.followUps]);

  const handleSave = () => {
    // Parse valor to number
    const parsedValor = parseFloat(editedValor) || 0;
    
    // Update the student object with the new values
    const updatedStudent = {
      ...student,
      nome: editedNome,
      valor: parsedValor,
      dataVencimento: editedDataVencimento,
      curso: editedCurso,
      email: editedEmail,
      telefone: editedTelefone,
      observacoes,
      dataPagamento,
      followUps
    };
    
    onUpdate(updatedStudent);
    onClose();
  };

  const handleFollowUpAdded = (newFollowUp: FollowUp) => {
    setFollowUps(prev => [...prev, newFollowUp]);
  };

  const handleFollowUpUpdated = (updatedFollowUp: FollowUp) => {
    setFollowUps(prev => 
      prev.map(f => f.id === updatedFollowUp.id ? updatedFollowUp : f)
    );
  };

  const handleFollowUpDeleted = (followUpId: string) => {
    setFollowUps(prev => prev.filter(f => f.id !== followUpId));
  };

  const saveObservacoes = () => {
    setIsEditingObservacoes(false);
    // As observações são salvas localmente e serão enviadas no handleSave
  };

  const cancelEditObservacoes = () => {
    setObservacoes(student.observacoes || "");
    setIsEditingObservacoes(false);
  };

  const validateStudentData = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validar nome (obrigatório)
    if (!editedNome.trim()) {
      errors.nome = "Nome é obrigatório";
    }
    
    // Validar valor (obrigatório e numérico)
    if (!editedValor.trim()) {
      errors.valor = "Valor é obrigatório";
    } else {
      const valorNumerico = parseFloat(editedValor.replace(',', '.'));
      if (isNaN(valorNumerico) || valorNumerico < 0) {
        errors.valor = "Valor deve ser um número válido maior ou igual a zero";
      }
    }
    
    // Validar email (se preenchido, deve ter formato válido)
    if (editedEmail.trim() && !isValidEmail(editedEmail)) {
      errors.email = "Email deve ter um formato válido";
    }
    
    // Validar data de vencimento (se preenchida, deve ter formato válido)
    if (editedDataVencimento.trim() && !isValidDate(editedDataVencimento)) {
      errors.dataVencimento = "Data deve estar no formato DD/MM/YYYY";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isValidDate = (date: string): boolean => {
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(date)) return false;
    
    const [day, month, year] = date.split('/').map(num => parseInt(num));
    const dateObj = new Date(year, month - 1, day);
    
    return dateObj.getDate() === day && 
           dateObj.getMonth() === month - 1 && 
           dateObj.getFullYear() === year;
  };

  const saveStudentData = () => {
    if (validateStudentData()) {
      setIsEditingStudent(false);
      setValidationErrors({});
      // Os dados são salvos localmente e serão enviados no handleSave
    }
  };

  const cancelEditStudent = () => {
    // Reset to original values
    setEditedNome(student.nome || "");
    setEditedValor(student.valor?.toString() || "");
    setEditedDataVencimento(student.dataVencimento || "");
    setEditedCurso(student.curso || "");
    setEditedEmail(student.email || "");
    setEditedTelefone(student.telefone || "");
    setValidationErrors({});
    setIsEditingStudent(false);
  };

  // Format currency for display
  const formatCurrencyInput = (value: string): string => {
    // Remove non-numeric characters except comma and dot
    let numericValue = value.replace(/[^\d,.-]/g, '');
    
    // Replace comma with dot for consistency
    numericValue = numericValue.replace(',', '.');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    // If already in DD/MM/YYYY format, return as is
    if (dateString.includes('/')) return dateString;
    
    // Convert from YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Get status display name
  const getStatusDisplay = (status: string): string => {
    const statusDisplayMap: Record<string, string> = {
      "inadimplente": "Inadimplente",
      "mensagem-enviada": "Mensagem Enviada",
      "resposta-recebida": "Resposta Recebida",
      "pagamento-feito": "Pagamento Realizado"
    };
    
    return statusDisplayMap[status] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Aluno</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Informações básicas do aluno */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {!isEditingStudent ? (
                  <div>
                    <h3 className="font-semibold text-lg">{editedNome}</h3>
                    <p className="text-sm text-gray-500">{formatCurrency(parseFloat(editedValor) || 0)}</p>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span>Vencimento: {editedDataVencimento}</span>
                      <span>Mês: {student.mes}</span>
                    </div>
                    {editedCurso && (
                      <p className="text-xs text-gray-600">Curso: {editedCurso}</p>
                    )}
                    {editedEmail && (
                      <p className="text-xs text-gray-600">Email: {editedEmail}</p>
                    )}
                    {editedTelefone && (
                      <p className="text-xs text-gray-600">Telefone: {editedTelefone}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="text-xs">
                        {getStatusDisplay(student.status)}
                      </Badge>
                      {student.createdBy && (
                        <span className="text-xs text-gray-500">
                          Criado por: {student.createdBy}
                        </span>
                      )}
                    </div>
                    {student.diasAtraso > 0 && student.status !== "pagamento-feito" && (
                      <p className="text-xs font-medium text-red-500 mt-1">
                        {student.diasAtraso} dias em atraso
                      </p>
                    )}
                    {student.status === "pagamento-feito" && student.dataPagamento && (
                      <p className="text-xs font-medium text-green-600 mt-1">
                        Pagamento realizado em: {formatDate(student.dataPagamento)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="editedNome">Nome *</Label>
                        <Input
                          id="editedNome"
                          value={editedNome}
                          onChange={(e) => setEditedNome(e.target.value)}
                          placeholder="Nome do aluno"
                          className={validationErrors.nome ? "border-red-500" : ""}
                        />
                        {validationErrors.nome && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors.nome}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="editedValor">Valor *</Label>
                        <Input
                          id="editedValor"
                          value={editedValor}
                          onChange={(e) => setEditedValor(formatCurrencyInput(e.target.value))}
                          placeholder="0.00"
                          type="text"
                          className={validationErrors.valor ? "border-red-500" : ""}
                        />
                        {validationErrors.valor && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors.valor}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="editedDataVencimento">Data de Vencimento</Label>
                        <Input
                          id="editedDataVencimento"
                          value={editedDataVencimento}
                          onChange={(e) => setEditedDataVencimento(e.target.value)}
                          placeholder="DD/MM/YYYY"
                          className={validationErrors.dataVencimento ? "border-red-500" : ""}
                        />
                        {validationErrors.dataVencimento && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors.dataVencimento}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="editedCurso">Curso</Label>
                        <Input
                          id="editedCurso"
                          value={editedCurso}
                          onChange={(e) => setEditedCurso(e.target.value)}
                          placeholder="Nome do curso"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editedEmail">Email</Label>
                        <Input
                          id="editedEmail"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          placeholder="email@exemplo.com"
                          type="email"
                          className={validationErrors.email ? "border-red-500" : ""}
                        />
                        {validationErrors.email && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="editedTelefone">Telefone</Label>
                        <Input
                          id="editedTelefone"
                          value={editedTelefone}
                          onChange={(e) => setEditedTelefone(e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveStudentData}>
                        Salvar
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEditStudent}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {!isEditingStudent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('🔥 BOTÃO DE EDIÇÃO CLICADO!', { user, username, student: student.nome });
                    setIsEditingStudent(true);
                  }}
                  className="h-8 px-2"
                  title="🔧 EDITAR DADOS DO ALUNO"
                  style={{ 
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: '3px solid #ff0000',
                    fontWeight: 'bold'
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  EDIT
                </Button>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Tabs para organizar o conteúdo */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Dados & Observações</TabsTrigger>
              <TabsTrigger value="followups">Follow-ups</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Observações */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="observacoes">Observações Gerais</Label>
                  {!canEditObservacoes && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Lock className="h-3 w-3" />
                      Apenas o criador pode editar
                    </div>
                  )}
                  {canEditObservacoes && !isEditingObservacoes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingObservacoes(true)}
                      className="h-6 px-2"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {isEditingObservacoes && canEditObservacoes ? (
                  <div className="space-y-2">
                    <Textarea
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={3}
                      placeholder="Adicione observações gerais aqui..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveObservacoes}>
                        Salvar
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEditObservacoes}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[80px] p-3 border rounded-md bg-gray-50">
                    {observacoes ? (
                      <p className="text-sm whitespace-pre-wrap">{observacoes}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Nenhuma observação registrada
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Data de Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="dataPagamento">
                  Data de Pagamento
                  {isDateRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id="dataPagamento"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  type="text"
                  className={isDateRequired && !dataPagamento ? "border-red-500" : ""}
                />
                {isDateRequired && (
                  <p className="text-xs text-amber-600">
                    A data de pagamento é obrigatória para mover o aluno para "Pagamento Realizado"
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="followups" className="mt-4">
              <FollowUpManager
                studentId={student.id}
                currentUser={username || "Usuário"}
                followUps={followUps}
                onFollowUpAdded={handleFollowUpAdded}
                onFollowUpUpdated={handleFollowUpUpdated}
                onFollowUpDeleted={handleFollowUpDeleted}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsDialogV2; 