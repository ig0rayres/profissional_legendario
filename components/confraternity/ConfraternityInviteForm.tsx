// ============================================
// Component: ConfraternityInviteForm
// Formulário aprimorado para solicitar confraternização
// Inclui: Calendário, Horário, Local, Google Calendar
// ============================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarIcon, MapPin, MessageSquare, Loader2, Swords, Clock, ExternalLink, CalendarPlus } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { sendConfraternityInvite } from '@/lib/api/confraternity'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ConfraternityInviteFormProps {
    receiverId: string
    receiverName: string
    currentUserId: string
    currentUserName: string
    remainingInvites: number
    onSuccess?: () => void
    onCancel?: () => void
}

// Horários disponíveis
const TIME_SLOTS = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
]

export function ConfraternityInviteForm({
    receiverId,
    receiverName,
    currentUserId,
    currentUserName,
    remainingInvites,
    onSuccess,
    onCancel
}: ConfraternityInviteFormProps) {
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<Date>()
    const [time, setTime] = useState<string>('')
    const [location, setLocation] = useState('')
    const [locationAddress, setLocationAddress] = useState('')
    const [message, setMessage] = useState('')
    const [addToCalendar, setAddToCalendar] = useState(true)
    const [calendarOpen, setCalendarOpen] = useState(false)

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate)
        setCalendarOpen(false) // Fechar ao selecionar
    }

    // Gerar link do Google Calendar
    const generateGoogleCalendarLink = () => {
        if (!date || !time) return null

        const startDate = new Date(date)
        const [hours, minutes] = time.split(':').map(Number)
        startDate.setHours(hours, minutes, 0, 0)

        // Duração padrão: 2 horas
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)

        const formatDateForGoogle = (d: Date) => {
            return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
        }

        const title = encodeURIComponent(`Confraria: ${currentUserName} + ${receiverName}`)
        const details = encodeURIComponent(`Confraria marcada via Rota Business Club\n\n${message || 'Encontro de confraternização entre membros da Rota do Valente.'}`)
        const locationParam = encodeURIComponent(locationAddress || location || 'A definir')

        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}&details=${details}&location=${locationParam}&sf=true&output=xml`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!date || !time) {
            toast.error('Selecione a data e horário')
            return
        }

        setLoading(true)

        try {
            // Combinar data e hora
            const startDate = new Date(date)
            const [hours, minutes] = time.split(':').map(Number)
            startDate.setHours(hours, minutes, 0, 0)
            const dateTime = startDate.toISOString()

            const result = await sendConfraternityInvite(
                currentUserId,
                receiverId,
                dateTime,
                `${location}${locationAddress ? ' - ' + locationAddress : ''}`,
                message || null
            )

            if (result.success) {
                toast.success(`Solicitação de Confraria enviada para ${receiverName}!`, {
                    description: `Caso ${receiverName} aceite, você será notificado. Pra cima, Valente! 🏹`
                })

                // Abrir Google Calendar em nova aba
                if (addToCalendar) {
                    const calendarLink = generateGoogleCalendarLink()
                    if (calendarLink) {
                        window.open(calendarLink, '_blank')
                    }
                }

                onSuccess?.()
            } else {
                toast.error('Erro ao enviar convite', {
                    description: result.error
                })
            }
        } catch (error) {
            toast.error('Erro ao enviar convite')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-primary/20 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
                    <Swords className="h-6 w-6" />
                    Solicitar Confraria
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Para: <span className="font-semibold text-foreground">{receiverName}</span>
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Data e Horário lado a lado */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Data com Calendário */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold text-sm">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            Data *
                        </Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl border" align="start" sideOffset={4}>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Horário */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-semibold text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            Horário *
                        </Label>
                        <Select value={time} onValueChange={setTime}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 z-[100]">
                                {TIME_SLOTS.map((slot) => (
                                    <SelectItem key={slot} value={slot}>
                                        {slot}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Local */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-semibold">
                        <MapPin className="h-4 w-4 text-primary" />
                        Local do Encontro
                    </Label>
                    <Input
                        placeholder="Ex: Café Central, Shopping Plaza..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                {/* Endereço */}
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                        Endereço Completo (opcional)
                    </Label>
                    <Input
                        placeholder="Rua, número, bairro, cidade..."
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                    />
                </div>

                {/* Mensagem */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-semibold">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Mensagem
                    </Label>
                    <Textarea
                        placeholder="Olá! Gostaria de marcar uma confraternização para trocarmos ideias sobre..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                    />
                </div>

                {/* Google Calendar Option */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <input
                        type="checkbox"
                        id="addToCalendar"
                        checked={addToCalendar}
                        onChange={(e) => setAddToCalendar(e.target.checked)}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="addToCalendar" className="flex items-center gap-2 text-sm cursor-pointer">
                        <CalendarPlus className="h-4 w-4 text-blue-500" />
                        Adicionar ao Google Calendar após enviar
                    </label>
                </div>

                {/* Info Boxes */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Convites restantes */}
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                            💡 Restam <span className="font-bold">{remainingInvites}</span> convite(s)
                        </p>
                    </div>

                    {/* Gamificação */}
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                            🎁 +10 XP ao enviar
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || remainingInvites === 0 || !date || !time}
                        className="flex-1"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Swords className="mr-2 h-4 w-4" />
                                Enviar Convite
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
