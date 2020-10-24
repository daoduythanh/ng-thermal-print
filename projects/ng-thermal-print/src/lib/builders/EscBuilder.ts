import { PrintBuilder } from './PrintBuilder';
import { PrintBuffer } from "./PrintBuffer";
declare var TextEncoder: any;

const ESC = 0x1b;
const GS = 0x1D;
const CASH_DRAWER = {
    0: new Uint8Array([0x00, 0x88, 0xfa]),
    1: new Uint8Array([0x01, 0x88, 0xfa])
};

export class EscBuilder extends PrintBuilder {
    private encoder = new TextEncoder();
    private buffer: PrintBuffer;

    constructor() {
        super();
    }

    init(): EscBuilder {
        this.buffer = new PrintBuffer();
        this.write(ESC);
        this.write("@");
        return this;
    }

    flush(): Uint8Array {
        return this.buffer.flush();
    }

    feed(lineCount: number = 1): EscBuilder {
        this.write(ESC);
        this.write("d");
        this.write(lineCount);
        return this;
    }

    cut(cutType: string = 'full'): EscBuilder {
        this.write(GS);
        this.write("V");
        this.write(cutType === 'full' ? 1 : 0);

        return this;
    }

    writeLine(value: string): EscBuilder {
        return this.write(`${value}\n`);
    }

    setInverse(inverse: boolean = true): EscBuilder {
        this.write(GS);
        this.write("B");
        this.write(inverse ? 1 : 0);

        return this;
    }

    setUnderline(value: boolean = true): EscBuilder {
        this.write(ESC);
        this.write("-");
        this.write(value ? 1 : 0);
        return this;
    }

    setJustification(value: string = 'left'): EscBuilder {
        let alignment;
        switch (value) {
            case "center":
                alignment = 1
                break;
            case "right":
                alignment = 2;
                break;
            default:
                alignment = 0;
                break;
        }
        this.write(ESC);
        this.write("a");
        this.write(alignment);

        return this;
    }

    setBold(bold: boolean = true): EscBuilder {
        this.write(ESC);
        this.write("E");
        this.write(bold ? 1 : 0);

        return this;
    }

    /**
    @param mode 0, 0x30
    */
    setSize(size: string = 'normal'): EscBuilder {
        this.write(ESC);
        this.write("!");
        this.write((size === 'normal') ? 0 : 0x30);

        return this;
    }

    openCashDrawer(pin: number = 0): EscBuilder {
        if (pin !== 0 && pin !== 1) {
            throw new Error('ESC/POS Cash Drawer pin can only be 0 or 1');
        }

        this.write(ESC);
        this.write('p');
        this.write(CASH_DRAWER[pin]);

        return this;
    }

    private write(value: string | Uint8Array | number): any {
        if (typeof value === "number") {
            this.buffer.writeUInt8(value);
        } else if (typeof value === "string") {
            this.buffer.write(this.encoder.encode(value));
        } else {
            this.buffer.write(value);
        }
        return this;
    }
}