import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFarmerDto {
  @ApiProperty({ example: 'Maria da Silva' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: '123.456.789-09' })
  @IsString()
  @IsNotEmpty()
  cpf!: string;

  @ApiProperty({ required: false, example: '1986-05-10' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ required: false, example: '+55 11 99999-0000' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateFarmerDto extends PartialType(OmitType(CreateFarmerDto, ['cpf'] as const)) {
  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
