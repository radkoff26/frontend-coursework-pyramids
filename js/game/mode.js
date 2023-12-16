export const Mode = {
    'Static': 'Static',
    'Dynamic': 'Dynamic',
    'Resizing': 'Resizing'
}

export const ModeMap = new Map()

ModeMap.set(Mode.Static, 'Статический')
ModeMap.set(Mode.Dynamic, 'Динамический')
ModeMap.set(Mode.Resizing, 'Увеличительный')