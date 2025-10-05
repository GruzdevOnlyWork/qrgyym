-- DropForeignKey
ALTER TABLE "public"."ExerciseMuscles" DROP CONSTRAINT "ExerciseMuscles_exerciseId_fkey";

-- AddForeignKey
ALTER TABLE "ExerciseMuscles" ADD CONSTRAINT "ExerciseMuscles_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
