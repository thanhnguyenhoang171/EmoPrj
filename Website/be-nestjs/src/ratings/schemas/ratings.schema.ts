import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'src/types/schemas/type.schema'
import { Product } from 'src/products/schemas/products.schema';

export type RatingDocument = HydratedDocument<Rating>;

@Schema({ timestamps: true })
export class Rating {


    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Type.name })
    typeId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name })
    productId: mongoose.Schema.Types.ObjectId;

    @Prop()
    userId: mongoose.Schema.Types.ObjectId;


    @Prop()
    comment: string;



    @Prop() // Image feedback from customers
    url: string;

    @Prop({ type: mongoose.Schema.Types.Array })
    detectedEmotion: {
        class: string;
        confidenceScore: number;
        
    }[]

    // @Prop({
    //     type: [
    //         {
    //             emotion: { type: String },             // e.g., HAPPY, SAD, ANGRY, NEUTRAL
    //             confidenceScore: { type: Number },     // Value between 0 and 1
    //         },
    //     ],
    // })
    // detectedEmotion: {
    //     emotion: string;
    //     confidenceScore: number;
    // }[];

    // @Prop({
    //     type: {
    //         emotion: { type: String },             // Emotion detected from comment text (phoBERT)
    //         confidenceScore: { type: Number },     // Confidence score for the prediction
    //         // modelVersion: { type: String },        // Version of phoBERT used
    //     },
    // })
    // commentEmotionAnalysis: {
    //     emotion: string;
    //     confidenceScore: number;
    //     // modelVersion: string;
    // };


    @Prop()
    status: string;

    @Prop()
    isPositive: string;

    @Prop({ type: mongoose.Schema.Types.Array })
    history: {
        status: string;
        updatedAt: Date;
        updatedBy: {
            _id: mongoose.Schema.Types.ObjectId;
            email: string;
        };
    }[]

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);