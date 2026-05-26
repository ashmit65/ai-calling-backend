import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntentService } from '../intent/intent.service';

@Injectable()
export class CallsService {

  constructor(
    private prisma: PrismaService,
    private intentService: IntentService
  ) {}

  findAll(){
    return this.prisma.call.findMany();
  }

  create(body:any){
    const detectedIntent = body.transcript 
      ? this.intentService.detect(body.transcript)
      : body.intent;

    return this.prisma.call.create({

      data:{
        phone: body.phone,
        intent: detectedIntent,
        transcript: body.transcript
      }

    });

  }

}